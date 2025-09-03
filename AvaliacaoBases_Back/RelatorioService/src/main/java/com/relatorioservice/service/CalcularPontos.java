package com.relatorioservice.service;

import com.relatorioservice.entity.dtos.CategoryConformanceDTO;
import com.relatorioservice.entity.fora.Visita.RelatoEntity;
import com.relatorioservice.entity.fora.forms.dto.CamposFormResponse;
import com.relatorioservice.entity.fora.forms.dto.FormResponse;
import com.relatorioservice.entity.fora.forms.dto.RespostaResponse;
import com.relatorioservice.entity.fora.forms.enums.CheckBox;
import com.relatorioservice.entity.fora.viatura.Itens;
import com.relatorioservice.entity.fora.viatura.ViaturaEntity;

import java.util.*;
import java.util.stream.Collectors;

public class CalcularPontos {

    private static final double THRESHOLD_FORTES = 80.0;
    private static final double THRESHOLD_CRITICOS = 20.0;

    /**
     * Calcula pontos fortes a partir de forms/respostas/viaturas/relatos.
     * Retorna uma lista de descrições (categoria - campo) e também entradas como "Melhor categoria" / "Melhor viatura".
     */
    public static List<String> calcularPontosFortes(List<FormResponse> forms,
                                                    List<RespostaResponse> respostas,
                                                    List<ViaturaEntity> viaturas,
                                                    List<RelatoEntity> relatos) {
        List<String> pontos = new ArrayList<>();
        if (forms == null || respostas == null) {
            pontos.add("Dados insuficientes para identificar pontos fortes");
            return pontos;
        }

        Map<Long, CamposFormResponse> camposById = forms.stream()
                .flatMap(f -> Optional.ofNullable(f.campos()).orElse(List.of()).stream())
                .collect(Collectors.toMap(CamposFormResponse::id, c -> c));

        // 1) Melhor categoria (maior média %TRUE entre seus campos checkbox)
        Map<String, CategoryConformanceDTO> confDetalhada = calcularConformidadesDetalhadas(forms, respostas);
        confDetalhada.entrySet().stream()
                .max(Comparator.comparingDouble(e -> e.getValue().getMediaPercentTrue()))
                .ifPresent(e -> pontos.add(String.format("Melhor categoria: %s (%.1f%% TRUE médio)", e.getKey(), e.getValue().getMediaPercentTrue())));

        // 2) Campos com alta conformidade (>= THRESHOLD_FORTES) - Agrupados por categoria
        Map<Long, Double> percentTruePorCampo = calcularPercentTruePorCampo(forms, respostas);
        Map<Long, Integer> countsPorCampo = calcularCountPorCampo(forms, respostas);

        // Agrupar campos por categoria
        Map<String, List<Long>> camposPorCategoria = new HashMap<>();
        for (Long campoId : percentTruePorCampo.keySet()) {
            CamposFormResponse campo = camposById.get(campoId);
            String categoria = getCategoriaDoCampo(campo, forms);
            camposPorCategoria.computeIfAbsent(categoria, k -> new ArrayList<>()).add(campoId);
        }

        // Contar itens com alta conformidade por categoria
        List<String> categoriasFortes = new ArrayList<>();
        for (Map.Entry<String, List<Long>> entry : camposPorCategoria.entrySet()) {
            String categoria = entry.getKey();
            List<Long> camposIds = entry.getValue();
            long countAltaConformidade = camposIds.stream()
                    .filter(campoId -> percentTruePorCampo.getOrDefault(campoId, 0.0) >= THRESHOLD_FORTES)
                    .count();
            if (countAltaConformidade > 0) {
                categoriasFortes.add(String.format("%s: %d itens com alta conformidade", categoria, countAltaConformidade));
            }
        }

        if (!categoriasFortes.isEmpty()) {
            pontos.addAll(categoriasFortes);
        }

        // 3) Melhor viatura
        Optional<ViaturaEntity> melhorViatura = Optional.ofNullable(viaturas).orElse(List.of()).stream()
                .filter(v -> v.getItens() != null && !v.getItens().isEmpty())
                .max(Comparator.comparingDouble(v ->
                        v.getItens().stream().mapToDouble(Itens::getConformidade).average().orElse(0.0)
                ));

        melhorViatura.ifPresent(v -> {
            double media = v.getItens().stream().mapToDouble(Itens::getConformidade).average().orElse(0.0);
            pontos.add(String.format("Melhor viatura: %s (%.1f%%)", v.getPlaca(), media));
        });

        // 4) Melhor equipamento
        Optional<Itens> melhorEquipamento = Optional.ofNullable(viaturas).orElse(List.of()).stream()
                .flatMap(v -> Optional.ofNullable(v.getItens()).orElse(List.of()).stream())
                .max(Comparator.comparingInt(Itens::getConformidade));

        melhorEquipamento.ifPresent(item -> pontos.add(String.format("Melhor equipamento: %s (%d%%)", item.getNome(), item.getConformidade())));

        // 5) Relatos resolvidos
        long relatosResolvidos = Optional.ofNullable(relatos).orElse(List.of()).stream().filter(RelatoEntity::getResolvido).count();
        if (relatosResolvidos > 0) {
            pontos.add(relatosResolvidos + " relatos resolvidos");
        }

        return pontos.isEmpty() ? List.of("Nenhum destaque identificado") : pontos;
    }

    /**
     * Obtém a categoria de um campo
     */
    private static String getCategoriaDoCampo(CamposFormResponse campo, List<FormResponse> forms) {
        if (campo == null) return "Sem categoria";

        for (FormResponse form : forms) {
            if (form.campos() != null && form.campos().stream().anyMatch(c -> c.id().equals(campo.id()))) {
                return form.categoria();
            }
        }
        return "Sem categoria";
    }

    /**
     * Calcula pontos críticos (oposto dos fortes).
     */
    public static List<String> calcularPontosCriticos(List<FormResponse> forms,
                                                      List<RespostaResponse> respostas,
                                                      List<RelatoEntity> relatos,
                                                      List<ViaturaEntity> viaturas) {
        List<String> criticos = new ArrayList<>();
        if (forms == null || respostas == null) {
            criticos.add("Dados insuficientes para identificar pontos críticos");
            return criticos;
        }

        Map<Long, CamposFormResponse> camposById = forms.stream()
                .flatMap(f -> Optional.ofNullable(f.campos()).orElse(List.of()).stream())
                .collect(Collectors.toMap(CamposFormResponse::id, c -> c));

        Map<String, CategoryConformanceDTO> confDetalhada = calcularConformidadesDetalhadas(forms, respostas);
        confDetalhada.entrySet().stream()
                .min(Comparator.comparingDouble(e -> e.getValue().getMediaPercentTrue()))
                .ifPresent(e -> criticos.add(String.format("Pior categoria: %s (%.1f%% TRUE médio)", e.getKey(), e.getValue().getMediaPercentTrue())));

        Map<Long, Double> percentTruePorCampo = calcularPercentTruePorCampo(forms, respostas);
        Map<Long, Integer> countsPorCampo = calcularCountPorCampo(forms, respostas);

        // Pior campo
        percentTruePorCampo.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .ifPresent(entry -> {
                    Long campoId = entry.getKey();
                    Double pct = entry.getValue();
                    CamposFormResponse campo = camposById.get(campoId);
                    String label = buildCampoLabel(campo, forms);
                    int count = countsPorCampo.getOrDefault(campoId, 0);
                    criticos.add(String.format("Pior campo: %s (%.1f%% TRUE, %d respostas)", label, pct, count));
                });

        // Campos com baixa conformidade (<= THRESHOLD_CRITICOS)
        List<String> camposCriticos = percentTruePorCampo.entrySet().stream()
                .filter(e -> e.getValue() <= THRESHOLD_CRITICOS)
                .filter(e -> countsPorCampo.getOrDefault(e.getKey(), 0) > 0) // Apenas campos com respostas
                .sorted(Map.Entry.comparingByValue())
                .map(e -> {
                    CamposFormResponse campo = camposById.get(e.getKey());
                    String label = buildCampoLabel(campo, forms);
                    int count = countsPorCampo.getOrDefault(e.getKey(), 0);
                    return String.format("%s (%.1f%% TRUE, %d respostas)", label, e.getValue(), count);
                })
                .toList();

        if (!camposCriticos.isEmpty()) {
            for (String cCriticos : camposCriticos) {
                criticos.add("Baixa conformidade: " + cCriticos);
            }
        }

        // viaturas piores
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

    /**
     * Calcula conformidade detalhada por categoria.
     * Retorna mapa categoria -> CategoryConformanceDTO
     */
    public static Map<String, CategoryConformanceDTO> calcularConformidadesDetalhadas(List<FormResponse> forms,
                                                                                      List<RespostaResponse> respostas) {
        Map<String, CategoryConformanceDTO> mapa = new HashMap<>();
        if (forms == null || respostas == null) return mapa;

        Map<Long, Double> percentTruePorCampo = calcularPercentTruePorCampo(forms, respostas);
        Map<Long, Double> percentFalsePorCampo = calcularPercentFalsePorCampo(forms, respostas);
        Map<Long, Double> percentNotGivenPorCampo = calcularPercentNotGivenPorCampo(forms, respostas);

        for (FormResponse form : forms) {
            if (form.campos() == null) {
                mapa.put(form.categoria(), new CategoryConformanceDTO(form.categoria(), 0.0, 0.0, 0.0, 0.0));
                continue;
            }

            List<CamposFormResponse> camposCheckbox = form.campos().stream()
                    .filter(c -> c.tipo() != null && c.tipo().name().equalsIgnoreCase("CHECKBOX"))
                    .toList();

            if (camposCheckbox.isEmpty()) {
                mapa.put(form.categoria(), new CategoryConformanceDTO(form.categoria(), 0.0, 0.0, 0.0, 0.0));
                continue;
            }

            List<Double> listaTrue = new ArrayList<>();
            List<Double> listaFalse = new ArrayList<>();
            List<Double> listaNot = new ArrayList<>();
            int camposFora = 0;

            for (CamposFormResponse campo : camposCheckbox) {
                Double pTrue = percentTruePorCampo.getOrDefault(campo.id(), 0.0);
                Double pFalse = percentFalsePorCampo.getOrDefault(campo.id(), 0.0);
                Double pNot = percentNotGivenPorCampo.getOrDefault(campo.id(), 0.0);

                listaTrue.add(pTrue);
                listaFalse.add(pFalse);
                listaNot.add(pNot);

                if (pTrue < THRESHOLD_FORTES) camposFora++;
            }

            double mediaTrue = listaTrue.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            double mediaFalse = listaFalse.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            double mediaNot = listaNot.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            double percCamposFora = (double) camposFora / (double) camposCheckbox.size() * 100.0;

            mapa.put(form.categoria(), new CategoryConformanceDTO(form.categoria(), mediaTrue, mediaFalse, mediaNot, percCamposFora));
        }

        return mapa;
    }

    /**
     * Percentual global de itens fora da conformidade (campos CHECKBOX com percentTrue < THRESHOLD_FORTES).
     */
    public static double percentualItensForaConformidadeGlobal(List<FormResponse> forms, List<RespostaResponse> respostas) {
        if (forms == null || respostas == null) return 0.0;

        Map<Long, Double> percentTruePorCampo = calcularPercentTruePorCampo(forms, respostas);
        long totalCampos = percentTruePorCampo.size();
        if (totalCampos == 0) return 0.0;
        long fora = percentTruePorCampo.values().stream().filter(p -> p < THRESHOLD_FORTES).count();
        return (double) fora / (double) totalCampos * 100.0;
    }

    private static Map<Long, Double> calcularPercentTruePorCampo(List<FormResponse> forms, List<RespostaResponse> respostas) {
        Map<Long, Double> resultado = new HashMap<>();
        if (forms == null || respostas == null) return resultado;

        List<Long> campoIds = forms.stream()
                .flatMap(f -> Optional.ofNullable(f.campos()).orElse(List.of()).stream())
                .filter(c -> c.tipo() != null && c.tipo().name().equalsIgnoreCase("CHECKBOX"))
                .map(CamposFormResponse::id)
                .toList();

        for (Long campoId : campoIds) {
            List<RespostaResponse> rCampo = respostas.stream()
                    .filter(r -> r.campo() != null && r.campo().equals(campoId))
                    .toList();

            long trueCount = rCampo.stream()
                    .map(RespostaResponse::checkbox)
                    .filter(Objects::nonNull)
                    .filter(cb -> cb.equals(CheckBox.TRUE))
                    .count();

            long validCount = rCampo.stream()
                    .map(RespostaResponse::checkbox)
                    .filter(Objects::nonNull)
                    .filter(cb -> cb.equals(CheckBox.TRUE) || cb.equals(CheckBox.FALSE))
                    .count();

            // Só adiciona ao resultado se houver respostas válidas
            if (validCount > 0) {
                double percentTrue = (double) trueCount / (double) validCount * 100.0;
                resultado.put(campoId, percentTrue);
            }
        }
        return resultado;
    }

    private static Map<Long, Double> calcularPercentFalsePorCampo(List<FormResponse> forms, List<RespostaResponse> respostas) {
        Map<Long, Double> resultado = new HashMap<>();
        if (forms == null || respostas == null) return resultado;

        List<Long> campoIds = forms.stream()
                .flatMap(f -> Optional.ofNullable(f.campos()).orElse(List.of()).stream())
                .filter(c -> c.tipo() != null && c.tipo().name().equalsIgnoreCase("CHECKBOX"))
                .map(CamposFormResponse::id)
                .toList();

        for (Long campoId : campoIds) {
            List<RespostaResponse> rCampo = respostas.stream()
                    .filter(r -> r.campo() != null && r.campo().equals(campoId))
                    .toList();

            long falseCount = rCampo.stream()
                    .map(RespostaResponse::checkbox)
                    .filter(Objects::nonNull)
                    .filter(cb -> cb == CheckBox.FALSE)
                    .count();

            long validCount = rCampo.stream()
                    .map(RespostaResponse::checkbox)
                    .filter(Objects::nonNull)
                    .filter(cb -> cb != CheckBox.NOT_GIVEN)
                    .count();

            if (validCount == 0) {
                resultado.put(campoId, 0.0);
            } else {
                double percentFalse = (double) falseCount / (double) validCount * 100.0;
                resultado.put(campoId, percentFalse);
            }
        }

        return resultado;
    }

    private static Map<Long, Double> calcularPercentNotGivenPorCampo(List<FormResponse> forms, List<RespostaResponse> respostas) {
        Map<Long, Double> resultado = new HashMap<>();
        if (forms == null || respostas == null) return resultado;

        List<Long> campoIds = forms.stream()
                .flatMap(f -> Optional.ofNullable(f.campos()).orElse(List.of()).stream())
                .filter(c -> c.tipo() != null && c.tipo().name().equalsIgnoreCase("CHECKBOX"))
                .map(CamposFormResponse::id)
                .toList();

        for (Long campoId : campoIds) {
            List<RespostaResponse> rTodas = respostas.stream()
                    .filter(r -> r.campo() != null && r.campo().equals(campoId))
                    .toList();

            long notGiven = rTodas.stream()
                    .map(RespostaResponse::checkbox)
                    .filter(cb -> cb == CheckBox.NOT_GIVEN || cb == null)
                    .count();

            if (rTodas.isEmpty()) {
                resultado.put(campoId, 0.0);
            } else {
                double percentNotGiven = (double) notGiven / (double) rTodas.size() * 100.0;
                resultado.put(campoId, percentNotGiven);
            }
        }

        return resultado;
    }

    /**
     * Conta respostas válidas (TRUE/FALSE) por campo.
     */
    private static Map<Long, Integer> calcularCountPorCampo(List<FormResponse> forms, List<RespostaResponse> respostas) {
        Map<Long, Integer> resultado = new HashMap<>();
        if (forms == null || respostas == null) return resultado;

        List<Long> campoIds = forms.stream()
                .flatMap(f -> Optional.ofNullable(f.campos()).orElse(List.of()).stream())
                .filter(c -> c.tipo() != null && c.tipo().name().equalsIgnoreCase("CHECKBOX"))
                .map(CamposFormResponse::id)
                .toList();

        for (Long campoId : campoIds) {
            int count = (int) respostas.stream()
                    .filter(r -> r.campo() != null && r.campo().equals(campoId))
                    .map(RespostaResponse::checkbox)
                    .filter(Objects::nonNull)
                    .filter(cb -> cb != CheckBox.NOT_GIVEN)
                    .count();

            // Só adiciona se houver respostas
            if (count > 0) {
                resultado.put(campoId, count);
            }
        }

        return resultado;
    }

    private static String buildCampoLabel(CamposFormResponse campo, List<FormResponse> forms) {
        if (campo == null) return "Campo desconhecido";
        String categoria = getCategoriaDoCampo(campo, forms);
        return categoria + " - " + campo.titulo();
    }
}