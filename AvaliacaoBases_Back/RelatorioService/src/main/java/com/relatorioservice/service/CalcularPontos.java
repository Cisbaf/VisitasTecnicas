package com.relatorioservice.service;

import com.relatorioservice.entity.dtos.CategoryConformanceDTO;
import com.relatorioservice.entity.fora.Visita.RelatoEntity;
import com.relatorioservice.entity.fora.forms.dto.CamposFormResponse;
import com.relatorioservice.entity.fora.forms.dto.FormResponse;
import com.relatorioservice.entity.fora.forms.dto.RespostaResponse;
import com.relatorioservice.entity.fora.forms.enums.CheckBox;
import com.relatorioservice.entity.fora.forms.enums.Select;
import com.relatorioservice.entity.fora.forms.enums.Tipo;
import com.relatorioservice.entity.fora.viatura.Itens;
import com.relatorioservice.entity.fora.viatura.ViaturaEntity;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class CalcularPontos {

    private static final double THRESHOLD_FORTES = 80.0;
    private static final double THRESHOLD_CRITICOS = 20.0;
    private static final double NAO_CALCULADO = -1.0;


    public static List<String> calcularPontosFortes(List<FormResponse> forms,
                                                    List<RespostaResponse> respostas,
                                                    List<ViaturaEntity> viaturas,
                                                    List<RelatoEntity> relatos) {
        List<String> pontos = new ArrayList<>();
        if (forms == null || respostas == null) {
            pontos.add("Dados insuficientes para identificar pontos fortes");
            return pontos;
        }

        Map<Long, CamposFormResponse> camposById = getCamposById(forms);

        Map<String, CategoryConformanceDTO> confDetalhada = calcularConformidadesDetalhadas(forms, respostas);
        confDetalhada.entrySet().stream()
                .filter(e -> e.getValue().getMediaPercentTrue() > 0.0)
                .max(Comparator.comparingDouble(e -> e.getValue().getMediaPercentTrue()))
                .ifPresent(e -> pontos.add(String.format("Melhor categoria: %s (%.1f%% conformidade)",
                        e.getKey(),
                        e.getValue().getMediaPercentTrue())));

        GenericPercentResult gen = calcularPercentuaisGenericosPorCampo(forms, respostas);
        Map<Long, Double> percentTruePorCampo = gen.percentTrueByCampo;
        Map<Long, Double> percentConformeSelect = gen.percentConformeByCampo;

        Map<String, List<Long>> camposPorCategoria = new HashMap<>();
        Stream.concat(percentTruePorCampo.keySet().stream(), percentConformeSelect.keySet().stream())
                .distinct()
                .forEach(campoId -> {
                    CamposFormResponse campo = camposById.get(campoId);
                    String categoria = getCategoriaDoCampo(campo, forms);
                    camposPorCategoria.computeIfAbsent(categoria, k -> new ArrayList<>()).add(campoId);
                });

        List<String> categoriasFortes = new ArrayList<>();
        for (Map.Entry<String, List<Long>> entry : camposPorCategoria.entrySet()) {
            String categoria = entry.getKey();
            List<Long> camposIds = entry.getValue();
            long countAltaConformidade = camposIds.stream()
                    .filter(campoId -> {
                        if (percentTruePorCampo.containsKey(campoId)) {
                            return percentTruePorCampo.getOrDefault(campoId, 0.0) >= THRESHOLD_FORTES;
                        } else if (percentConformeSelect.containsKey(campoId)) {
                            return percentConformeSelect.getOrDefault(campoId, 0.0) >= THRESHOLD_FORTES;
                        }
                        return false;
                    })
                    .count();
            if (countAltaConformidade > 0) {
                categoriasFortes.add(String.format("%s: %d itens com alta conformidade", categoria, countAltaConformidade));
            }
        }

        if (!categoriasFortes.isEmpty()) {
            pontos.addAll(categoriasFortes);
        }

        Optional<ViaturaEntity> melhorViatura = Optional.ofNullable(viaturas).orElse(List.of()).stream()
                .filter(v -> v.getItens() != null && !v.getItens().isEmpty())
                .max(Comparator.comparingDouble(v ->
                        v.getItens().stream().mapToDouble(Itens::getConformidade).average().orElse(0.0)
                ));

        melhorViatura.ifPresent(v -> {
            double media = v.getItens().stream().mapToDouble(Itens::getConformidade).average().orElse(0.0);
            pontos.add(String.format("Melhor viatura: %s (%.1f%%)", v.getPlaca(), media));
        });

        Optional<Itens> melhorEquipamento = Optional.ofNullable(viaturas).orElse(List.of()).stream()
                .flatMap(v -> Optional.ofNullable(v.getItens()).orElse(List.of()).stream())
                .max(Comparator.comparingInt(Itens::getConformidade));

        melhorEquipamento.ifPresent(item -> pontos.add(String.format("Melhor equipamento: %s (%d%%)", item.getNome(), item.getConformidade())));

        long relatosResolvidos = Optional.ofNullable(relatos).orElse(List.of()).stream().filter(RelatoEntity::getResolvido).count();
        if (relatosResolvidos > 0) {
            pontos.add(relatosResolvidos + " relatos resolvidos");
        }

        return pontos.isEmpty() ? List.of("Nenhum destaque identificado") : pontos;
    }

    public static List<String> calcularPontosCriticos(List<FormResponse> forms,
                                                      List<RespostaResponse> respostas,
                                                      List<RelatoEntity> relatos,
                                                      List<ViaturaEntity> viaturas) {
        List<String> criticos = new ArrayList<>();
        if (forms == null || respostas == null) {
            criticos.add("Dados insuficientes para identificar pontos críticos");
            return criticos;
        }

        Map<Long, CamposFormResponse> camposById = getCamposById(forms);

        Map<String, CategoryConformanceDTO> confDetalhada = calcularConformidadesDetalhadas(forms, respostas);
        confDetalhada.entrySet().stream()
                .min(Comparator.comparingDouble(e -> e.getValue().getMediaPercentTrue()))
                .ifPresent(e -> criticos.add(String.format("Pior categoria: %s (%.1f%% conformidade)", e.getKey(), e.getValue().getMediaPercentTrue())));

        GenericPercentResult gen = calcularPercentuaisGenericosPorCampo(forms, respostas);
        Map<Long, Double> percentTruePorCampo = gen.percentTrueByCampo;
        Map<Long, Integer> countsPorCampo = gen.countCheckboxByCampo;

        Map<Long, Double> percentConformeSelect = gen.percentConformeByCampo;
        Map<Long, Integer> countsPorCampoSelect = gen.countSelectByCampo;

        Stream.concat(
                        percentTruePorCampo.entrySet().stream(),
                        percentConformeSelect.entrySet().stream()
                )
                .min(Map.Entry.comparingByValue())
                .ifPresent(entry -> {
                    Long campoId = entry.getKey();
                    Double pct = entry.getValue();
                    CamposFormResponse campo = camposById.get(campoId);
                    String label = buildCampoLabel(campo, forms);
                    int count = countsPorCampo.getOrDefault(campoId, countsPorCampoSelect.getOrDefault(campoId, 0));
                    criticos.add(String.format("Pior campo: %s (%.1f%% conformidade, %d respostas)", label, pct, count));
                });

        List<String> camposCriticos = Stream.concat(
                        percentTruePorCampo.entrySet().stream(),
                        percentConformeSelect.entrySet().stream()
                )
                .filter(e -> e.getValue() <= THRESHOLD_CRITICOS)
                .filter(e -> {
                    int count = countsPorCampo.getOrDefault(e.getKey(), countsPorCampoSelect.getOrDefault(e.getKey(), 0));
                    return count > 0;
                })
                .sorted(Map.Entry.comparingByValue())
                .map(e -> {
                    CamposFormResponse campo = camposById.get(e.getKey());
                    String label = buildCampoLabel(campo, forms);
                    int count = countsPorCampo.getOrDefault(e.getKey(), countsPorCampoSelect.getOrDefault(e.getKey(), 0));
                    return String.format("%s (%.1f%% conformidade, %d respostas)", label, e.getValue(), count);
                })
                .toList();

        if (!camposCriticos.isEmpty()) {
            for (String cCriticos : camposCriticos) {
                criticos.add("Baixa conformidade: " + cCriticos);
            }
        }

        Optional<ViaturaEntity> piorViatura = Optional.ofNullable(viaturas).orElse(List.of()).stream()
                .filter(v -> v.getItens() != null && !v.getItens().isEmpty())
                .min(Comparator.comparingDouble(v ->
                        v.getItens().stream().mapToDouble(Itens::getConformidade).average().orElse(100.0)
                ));

        piorViatura.ifPresent(v -> {
            double media = v.getItens().stream().mapToDouble(Itens::getConformidade).average().orElse(0.0);
            criticos.add(String.format("Pior viatura: %s (%.1f%%)", v.getPlaca(), media));
        });

        Optional<Itens> piorEquipamento = Optional.ofNullable(viaturas).orElse(List.of()).stream()
                .flatMap(v -> Optional.ofNullable(v.getItens()).orElse(List.of()).stream())
                .min(Comparator.comparingInt(Itens::getConformidade));

        piorEquipamento.ifPresent(item -> criticos.add(String.format("Pior equipamento: %s (%d%%)", item.getNome(), item.getConformidade())));

        long relatosPendentes = Optional.ofNullable(relatos).orElse(List.of()).stream().filter(r -> !r.getResolvido()).count();
        if (relatosPendentes > 0) {
            criticos.add(relatosPendentes + " relatos pendentes");
        }

        return criticos.isEmpty() ? List.of("Nenhum ponto crítico identificado") : criticos;
    }


    public static Map<String, CategoryConformanceDTO> calcularConformidadesDetalhadas(List<FormResponse> forms, List<RespostaResponse> respostas) {
        Map<String, CategoryConformanceDTO> mapa = new HashMap<>();
        if (forms == null || respostas == null) return mapa;

        for (FormResponse form : forms) {
            if (form.campos() == null || form.campos().isEmpty()) {
                mapa.put(form.categoria(), new CategoryConformanceDTO(form.categoria(), NAO_CALCULADO, 0.0, 0.0, 0.0));
                continue;
            }

            List<CamposFormResponse> camposRelevantes = form.campos().stream()
                    .filter(c -> c.tipo() != null &&
                            (c.tipo() == Tipo.CHECKBOX || c.tipo() == Tipo.SELECT))
                    .toList();

            if (camposRelevantes.isEmpty()) {
                mapa.put(form.categoria(), new CategoryConformanceDTO(form.categoria(), 0.0, 0.0, 0.0, 0.0));
                continue;
            }

            List<Double> listaTrue = new ArrayList<>();
            List<Double> listaFalse = new ArrayList<>();
            List<Double> listaNot = new ArrayList<>();
            int camposFora = 0;
            int camposComDados = 0;
            boolean categoriaAvaliada = false;

            for (CamposFormResponse campo : camposRelevantes) {
                Long id = campo.id();
                List<RespostaResponse> respostasCampo = respostas.stream()
                        .filter(r -> r.campoId() != null && r.campoId().equals(id))
                        .toList();

                if (respostasCampo.isEmpty()) {
                    continue;
                }

                // Verifica o tipo do campo diretamente em vez de depender dos valores das respostas
                if (campo.tipo() == Tipo.CHECKBOX) {
                    long trueCount = respostasCampo.stream()
                            .map(RespostaResponse::checkbox)
                            .filter(Objects::nonNull)
                            .filter(cb -> cb == CheckBox.TRUE)
                            .count();

                    long falseCount = respostasCampo.stream()
                            .map(RespostaResponse::checkbox)
                            .filter(Objects::nonNull)
                            .filter(cb -> cb == CheckBox.FALSE)
                            .count();

                    long notGiven = respostasCampo.stream()
                            .map(RespostaResponse::checkbox)
                            .filter(cb -> cb == null || cb == CheckBox.NOT_GIVEN)
                            .count();

                    long validCount = trueCount + falseCount;
                    if (validCount > 0) {
                        categoriaAvaliada = true;
                        double pTrue = (double) trueCount / validCount * 100.0;
                        double pFalse = (double) falseCount / validCount * 100.0;
                        double pNot = (double) notGiven / respostasCampo.size() * 100.0;

                        listaTrue.add(pTrue);
                        listaFalse.add(pFalse);
                        listaNot.add(pNot);

                        camposComDados++;
                        if (pTrue < THRESHOLD_FORTES) camposFora++;
                    }
                }
                else if (campo.tipo() == Tipo.SELECT) {
                    long conformeCount = respostasCampo.stream()
                            .map(RespostaResponse::select)
                            .filter(Objects::nonNull)
                            .filter(sel -> sel == Select.CONFORME)
                            .count();

                    long naoConformeCount = respostasCampo.stream()
                            .map(RespostaResponse::select)
                            .filter(Objects::nonNull)
                            .filter(sel -> sel == Select.NAO_CONFORME)
                            .count();

                    long parcialCount = respostasCampo.stream()
                            .map(RespostaResponse::select)
                            .filter(Objects::nonNull)
                            .filter(sel -> sel == Select.PARCIAL)
                            .count();

                    long notGivenCount = respostasCampo.stream()
                            .map(RespostaResponse::select)
                            .filter(sel -> sel == null || sel == Select.NAO_AVALIADO)
                            .count();

                    long validCount = conformeCount + naoConformeCount + parcialCount;

                    if (validCount > 0) {
                        categoriaAvaliada = true;
                        double pConforme = (double) conformeCount / validCount * 100.0;
                        double pNaoConforme = (double) naoConformeCount / validCount * 100.0;
                        double pParcial = (double) parcialCount / validCount * 100.0;
                        double pNot = (double) notGivenCount / respostasCampo.size() * 100.0;

                        listaTrue.add(pConforme);
                        // Considera não conforme e parcial como "false" para o cálculo
                        listaFalse.add(pNaoConforme + pParcial);
                        listaNot.add(pNot);

                        camposComDados++;
                        if (pConforme < THRESHOLD_FORTES) camposFora++;
                    }
                }
            }

            double mediaTrue;
            double mediaFalse;
            double mediaNot;
            double percCamposFora;

            if (!categoriaAvaliada) {
                mediaTrue = NAO_CALCULADO;
                mediaFalse = 0.0;
                mediaNot = 0.0;
                percCamposFora = 0.0;
            } else {
                mediaTrue = listaTrue.isEmpty() ? 0.0 : listaTrue.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                mediaFalse = listaFalse.isEmpty() ? 0.0 : listaFalse.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                mediaNot = listaNot.isEmpty() ? 0.0 : listaNot.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                percCamposFora = camposComDados == 0 ? 0.0 : (double) camposFora / camposComDados * 100.0;
            }

            mapa.put(form.categoria(), new CategoryConformanceDTO(form.categoria(), mediaTrue, mediaFalse, mediaNot, percCamposFora));
        }

        return mapa;
    }

    public static double percentualItensForaConformidadeGlobal(List<FormResponse> forms, List<RespostaResponse> respostas) {
        if (forms == null || respostas == null) return 0.0;

        GenericPercentResult gen = calcularPercentuaisGenericosPorCampo(forms, respostas);
        Set<Long> todos = new HashSet<>();
        todos.addAll(gen.percentTrueByCampo.keySet());
        todos.addAll(gen.percentConformeByCampo.keySet());

        if (todos.isEmpty()) return 0.0;

        long fora = todos.stream()
                .filter(id -> {
                    Double t = gen.percentTrueByCampo.get(id);
                    if (t != null) return t < THRESHOLD_FORTES;
                    Double s = gen.percentConformeByCampo.get(id);
                    return s != null && s < THRESHOLD_FORTES;
                })
                .count();

        return (double) fora / (double) todos.size() * 100.0;
    }

    private static class GenericPercentResult {
        Map<Long, Double> percentTrueByCampo = new HashMap<>();
        Map<Long, Double> percentConformeByCampo = new HashMap<>();
        Map<Long, Integer> countCheckboxByCampo = new HashMap<>();
        Map<Long, Integer> countSelectByCampo = new HashMap<>();
    }

    private static GenericPercentResult calcularPercentuaisGenericosPorCampo(List<FormResponse> forms, List<RespostaResponse> respostas) {
        GenericPercentResult res = new GenericPercentResult();
        if (forms == null || respostas == null) return res;

        Set<Long> campoIds = forms.stream()
                .flatMap(f -> Optional.ofNullable(f.campos()).orElse(List.of()).stream())
                .map(CamposFormResponse::id)
                .collect(Collectors.toSet());

        for (Long campoId : campoIds) {
            List<RespostaResponse> rCampo = respostas.stream()
                    .filter(r -> r.campoId() != null && r.campoId().equals(campoId))
                    .toList();

            if (rCampo.isEmpty()) {
                continue;
            }

            boolean anyCheckbox = rCampo.stream().anyMatch(rr -> rr.checkbox() != null);
            boolean anySelect = rCampo.stream().anyMatch(rr -> rr.select() != null);

            if (anyCheckbox) {
                long trueCount = rCampo.stream()
                        .map(RespostaResponse::checkbox)
                        .filter(Objects::nonNull)
                        .filter(cb -> cb == CheckBox.TRUE)
                        .count();

                long validCount = rCampo.stream()
                        .map(RespostaResponse::checkbox)
                        .filter(Objects::nonNull)
                        .filter(cb -> cb == CheckBox.TRUE || cb == CheckBox.FALSE)
                        .count();

                if (validCount > 0) {
                    double pct = (double) trueCount / (double) validCount * 100.0;
                    res.percentTrueByCampo.put(campoId, pct);
                    res.countCheckboxByCampo.put(campoId, (int) validCount);
                }
            } else if (anySelect) {
                long conformeCount = rCampo.stream()
                        .map(RespostaResponse::select)
                        .filter(Objects::nonNull)
                        .filter(sel -> sel == Select.CONFORME)
                        .count();

                long validCount = rCampo.stream()
                        .map(RespostaResponse::select)
                        .filter(Objects::nonNull)
                        .filter(sel -> sel == Select.CONFORME || sel == Select.NAO_CONFORME || sel == Select.PARCIAL)
                        .count();

                if (validCount > 0) {
                    double pct = (double) conformeCount / (double) validCount * 100.0;
                    res.percentConformeByCampo.put(campoId, pct);
                    res.countSelectByCampo.put(campoId, (int) validCount);
                }
            }
        }

        return res;
    }

    private static Map<Long, CamposFormResponse> getCamposById(List<FormResponse> forms) {
        if (forms == null) return Map.of();
        return forms.stream()
                .flatMap(f -> Optional.ofNullable(f.campos()).orElse(List.of()).stream())
                .collect(Collectors.toMap(CamposFormResponse::id, c -> c));
    }

    private static String buildCampoLabel(CamposFormResponse campo, List<FormResponse> forms) {
        if (campo == null) return "Campo desconhecido";
        String categoria = getCategoriaDoCampo(campo, forms);
        return categoria + " - " + campo.titulo();
    }

    private static String getCategoriaDoCampo(CamposFormResponse campo, List<FormResponse> forms) {
        if (campo == null) return "Sem categoria";

        for (FormResponse form : forms) {
            if (form.campos() != null && form.campos().stream().anyMatch(c -> c.id().equals(campo.id()))) {
                return form.categoria();
            }
        }
        return "Sem categoria";
    }
}