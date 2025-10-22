package com.relatorioservice.service;

import com.relatorioservice.entity.dtos.CategoryConformanceDTO;
import com.relatorioservice.entity.fora.Visita.VisitaEntity;
import com.relatorioservice.entity.fora.forms.dto.CamposFormResponse;
import com.relatorioservice.entity.fora.forms.dto.FormResponse;
import com.relatorioservice.entity.fora.forms.dto.RespostaResponse;
import com.relatorioservice.entity.fora.forms.enums.CheckBox;
import com.relatorioservice.entity.fora.forms.enums.Tipo;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
public class CalcularPontos {

    private static final double THRESHOLD_FORTES = 80.0;
    private static final double THRESHOLD_CRITICOS = 20.0;
    private static final double NAO_CALCULADO = -1.0;

    // Nova estrutura para resultados hierárquicos (igual ao frontend)
    static class ResultadosHierarquicos {
        Map<Long, PorFormulario> porFormulario = new HashMap<>();
        Map<Long, PorSummary> porSummary = new HashMap<>();
        Geral geral = new Geral();

        static class PorFormulario {
            int total;
            int conforme;
            double porcentagem;
            long summaryId;
        }

        static class PorSummary {
            int totalCampos = 0;
            int totalConforme = 0;
            double porcentagem = 0;
            List<Long> forms = new ArrayList<>();
        }

        static class Geral {
            int totalCampos = 0;
            int totalConforme = 0;
            double porcentagem = 0;
        }
    }

    static ResultadosHierarquicos calcularConformidadeHierarquica(
            List<FormResponse> inspectionForms,
            List<RespostaResponse> respostasVisita,
            VisitaEntity visita) {

        ResultadosHierarquicos resultados = new ResultadosHierarquicos();

        try {
            if (visita == null || visita.getId() == null) {
                return resultados;
            }

            Long visitaId = visita.getId();

            List<RespostaResponse> respostasDaVisita = respostasVisita.stream()
                    .filter(resposta -> resposta.visitaId() != null && resposta.visitaId().equals(visitaId))
                    .toList();

            // Primeiro: calcular a porcentagem de cada formulário
            for (FormResponse form : inspectionForms) {
                List<CamposFormResponse> checkboxFields = form.campos() != null ?
                        form.campos().stream()
                                .filter(c -> c.tipo() == Tipo.CHECKBOX)
                                .toList() :
                        new ArrayList<>();

                if (checkboxFields.isEmpty()) continue;

                int totalCampos = checkboxFields.size();
                int camposConformes = 0;

                for (CamposFormResponse field : checkboxFields) {
                    Optional<RespostaResponse> respostaOpt = respostasDaVisita.stream()
                            .filter(r -> Objects.equals(r.campoId(), field.id()))
                            .findFirst();

                    if (respostaOpt.isPresent()) {
                        RespostaResponse resposta = respostaOpt.get();
                        if (resposta.checkbox() == CheckBox.TRUE) {
                            camposConformes++;
                        }
                    }
                }

                double porcentagemForm = totalCampos > 0 ? (camposConformes * 100.0) / totalCampos : 0.0;

                ResultadosHierarquicos.PorFormulario porForm = new ResultadosHierarquicos.PorFormulario();
                porForm.total = totalCampos;
                porForm.conforme = camposConformes;
                porForm.porcentagem = porcentagemForm;
                porForm.summaryId = form.summaryId();
                resultados.porFormulario.put(form.id(), porForm);

                // Adiciona o formulário ao summary
                resultados.porSummary
                        .computeIfAbsent(form.summaryId(), id -> new ResultadosHierarquicos.PorSummary())
                        .forms.add(form.id());
            }

            // ✅ CORREÇÃO: Calcula a porcentagem por summary como MÉDIA SIMPLES das porcentagens dos formulários
            for (ResultadosHierarquicos.PorSummary summary : resultados.porSummary.values()) {
                double somaPorcentagens = 0;
                int formsComDados = 0;

                for (Long formId : summary.forms) {
                    ResultadosHierarquicos.PorFormulario form = resultados.porFormulario.get(formId);
                    if (form != null && form.total > 0) {
                        somaPorcentagens += form.porcentagem;
                        formsComDados++;
                    }
                }

                summary.porcentagem = formsComDados > 0 ? somaPorcentagens / formsComDados : 0.0;

                // Mantém os totais para referência (opcional)
                summary.totalCampos = summary.forms.stream()
                        .mapToInt(formId -> resultados.porFormulario.get(formId).total)
                        .sum();
                summary.totalConforme = summary.forms.stream()
                        .mapToInt(formId -> resultados.porFormulario.get(formId).conforme)
                        .sum();
            }

            // ✅ CORREÇÃO: Calcula a média geral como MÉDIA SIMPLES das porcentagens dos summaries
            List<Double> porcentagensSummaries = resultados.porSummary.values().stream()
                    .map(summary -> summary.porcentagem)
                    .filter(porcentagem -> porcentagem > 0) // Considera apenas summaries com dados
                    .toList();

            resultados.geral.porcentagem = porcentagensSummaries.isEmpty() ?
                    0.0 :
                    porcentagensSummaries.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

            return resultados;

        } catch (Exception err) {
            System.err.println("Erro processando conformidade hierárquica: " + err.getMessage());
            return resultados;
        }
    }


    public static List<String> calcularPontosFortes(List<FormResponse> forms,
                                                    List<RespostaResponse> respostas, VisitaEntity visita) {
        List<String> pontos = new ArrayList<>();
        if (forms == null || respostas == null) {
            return pontos;
        }

        Map<Long, CamposFormResponse> camposById = getCamposById(forms);
        Map<String, CategoryConformanceDTO> confDetalhada = calcularConformidadesDetalhadas(forms, respostas,visita);

        confDetalhada.entrySet().stream()
                .filter(e -> e.getValue().getMediaPercentTrue() > 0.0)
                .max(Comparator.comparingDouble(e -> e.getValue().getMediaPercentTrue()))
                .ifPresent(e -> {
                    double percentual = e.getValue().getMediaPercentTrue();
                    pontos.add(String.format("Melhor categoria: %s (%.1f%% conformidade)",
                            e.getKey(),
                            percentual));
                });

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

        return pontos;
    }

    public static List<String> calcularPontosCriticos(List<FormResponse> forms,
                                                      List<RespostaResponse> respostas, VisitaEntity visita) {
        List<String> criticos = new ArrayList<>();
        if (forms == null || respostas == null) {
            criticos.add("Dados insuficientes para identificar pontos críticos");
            return criticos;
        }

        Map<Long, CamposFormResponse> camposById = getCamposById(forms);

        Map<String, CategoryConformanceDTO> confDetalhada = calcularConformidadesDetalhadas(forms, respostas, visita);
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
            criticos.addAll(camposCriticos);
        }

        return criticos.isEmpty() ? List.of("Nenhum ponto crítico identificado") : criticos;
    }

    public static Map<String, CategoryConformanceDTO> calcularConformidadesDetalhadas(List<FormResponse> forms, List<RespostaResponse> respostas, VisitaEntity visita) {
        Map<String, CategoryConformanceDTO> mapa = new HashMap<>();
        if (forms == null || respostas == null) return mapa;

        ResultadosHierarquicos resultados = calcularConformidadeHierarquica(forms, respostas, visita);

        for (FormResponse form : forms) {
            if (form == null) continue;

            ResultadosHierarquicos.PorFormulario formData = resultados.porFormulario.get(form.id());

            if (formData == null) {
                // Se não tem dados do formulário, não foi calculado
                mapa.put(form.categoria(), new CategoryConformanceDTO(form.categoria(), NAO_CALCULADO, 0.0, 0.0, 0.0));
                continue;
            }

            double mediaTrue = formData.porcentagem;
            double mediaFalse = 0.0;
            double mediaNot = 0.0;
            double percCamposFora = 0.0;

            mapa.put(form.categoria(), new CategoryConformanceDTO(form.categoria(), mediaTrue, mediaFalse, mediaNot, percCamposFora));
        }

        return mapa;
    }

    // Mantém todos os métodos auxiliares existentes
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
            if (form == null) continue;
            if (form.campos() != null && form.campos().stream()
                    .filter(Objects::nonNull)
                    .anyMatch(c -> c.id() != null && c.id().equals(campo.id()))) {
                return form.categoria();
            }
        }
        return "Sem categoria";
    }
}