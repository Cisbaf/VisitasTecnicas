package com.avaliacaoservice.relatorio.service;

import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.dto.campos.CamposFormResponse;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import com.avaliacaoservice.form.entity.dto.resposta.RespostaResponse;
import com.avaliacaoservice.form.entity.emuns.CheckBox;
import com.avaliacaoservice.form.entity.emuns.Tipo;
import com.avaliacaoservice.form.service.FormMapper;
import com.avaliacaoservice.relatorio.entity.CategoryConformanceDTO;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalcularPontos {

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
            double porcentagem = 0;
        }
    }

    private static class GenericPercentResult {
        Map<Long, Double> percentTrueByCampo = new HashMap<>();
        Map<Long, Integer> countCheckboxByCampo = new HashMap<>();
        Map<Long, Double> percentConformeByCampo = new HashMap<>();
        Map<Long, Integer> countSelectByCampo = new HashMap<>();
    }


    static ResultadosHierarquicos calcularConformidadeHierarquica(List<FormResponse> inspectionForms, List<RespostaResponse> respostasVisita, VisitaResponse visita) {
        ResultadosHierarquicos resultados = new ResultadosHierarquicos();

        try {
            if (visita == null || visita.id() == null) {
                return resultados;
            }

            Long visitaId = visita.id();

            // Filtra apenas os forms da visita específica
            List<FormResponse> formsDaVisita = inspectionForms.stream()
                    .filter(form -> form.visitaId() != null && form.visitaId().equals(visitaId))
                    .toList();

            for (FormResponse form : formsDaVisita) {
                List<CamposFormEntity> checkboxFields = (form.campos() != null) ?
                        form.campos().stream()
                                .filter(c -> (c.getTipo() == Tipo.CHECKBOX))
                                .toList() :
                        new ArrayList<>();

                if (checkboxFields.isEmpty())
                    continue;

                int totalCampos = checkboxFields.size();
                int camposConformes = 0;

                for (CamposFormEntity field : checkboxFields) {
                    // Busca resposta pelo campoId (agora sem filtro de visitaId)
                    Optional<RespostaResponse> respostaOpt = respostasVisita.stream()
                            .filter(r -> Objects.equals(r.campoId(), field.getId()))
                            .findFirst();

                    if (respostaOpt.isPresent()) {
                        RespostaResponse resposta = respostaOpt.get();
                        if (resposta.checkbox() == CheckBox.TRUE) {
                            camposConformes++;
                        }
                    }
                }

                double porcentagemForm = camposConformes * 100.0D / totalCampos;

                ResultadosHierarquicos.PorFormulario porForm = new ResultadosHierarquicos.PorFormulario();
                porForm.total = totalCampos;
                porForm.conforme = camposConformes;
                porForm.porcentagem = porcentagemForm;
                porForm.summaryId = form.summaryId();
                resultados.porFormulario.put(form.id(), porForm);

                resultados.porSummary
                        .computeIfAbsent(form.summaryId(), id -> new ResultadosHierarquicos.PorSummary())
                        .forms.add(form.id());
            }

            // O restante do código para calcular summaries e geral permanece igual
            for (ResultadosHierarquicos.PorSummary summary : resultados.porSummary.values()) {
                double somaPorcentagens = 0.0D;
                int formsComDados = 0;

                for (Long formId : summary.forms) {
                    ResultadosHierarquicos.PorFormulario form = resultados.porFormulario.get(formId);
                    if (form != null && form.total > 0) {
                        somaPorcentagens += form.porcentagem;
                        formsComDados++;
                    }
                }

                summary.porcentagem = (formsComDados > 0) ? (somaPorcentagens / formsComDados) : 0.0D;
                summary.totalCampos = summary.forms.stream()
                        .mapToInt(formId -> resultados.porFormulario.get(formId).total)
                        .sum();
                summary.totalConforme = summary.forms.stream()
                        .mapToInt(formId -> resultados.porFormulario.get(formId).conforme)
                        .sum();
            }

            List<Double> porcentagensSummaries = resultados.porSummary.values().stream()
                    .map(summary -> summary.porcentagem)
                    .filter(porcentagem -> (porcentagem > 0.0D))
                    .toList();

            resultados.geral.porcentagem = porcentagensSummaries.isEmpty() ? 0.0D :
                    porcentagensSummaries.stream().mapToDouble(Double::doubleValue).average().orElse(0.0D);

            return resultados;
        } catch (Exception err) {
            System.err.println("Erro processando conformidade hierárquica: " + err.getMessage());
            err.printStackTrace(); // Adicione isso para ‘debugging’
            return resultados;
        }
    }


    public static List<String> calcularPontosFortes(List<FormResponse> forms, List<RespostaResponse> respostas, VisitaResponse visita) {
        List<String> pontos = new ArrayList<>();
        if (forms == null || respostas == null) {
            return pontos;
        }

        Map<Long, CamposFormResponse> camposById = getCamposById(forms);
        Map<String, CategoryConformanceDTO> confDetalhada = calcularConformidadesDetalhadas(forms, respostas, visita);

        confDetalhada.entrySet().stream()
                .filter(e -> (e.getValue().getMediaPercentTrue() > 0.0D))
                .max(Comparator.comparingDouble(e -> e.getValue().getMediaPercentTrue()))
                .ifPresent(e -> {
                    double percentual = e.getValue().getMediaPercentTrue();


                    pontos.add(String.format("Melhor categoria: %s (%.1f%% conformidade)", e.getKey(), percentual));
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


            long countAltaConformidade = camposIds.stream().filter(campoId -> percentTruePorCampo.containsKey(campoId) ? ((percentTruePorCampo.getOrDefault(campoId, 0.0D) >= 80.0D)) : (percentConformeSelect.containsKey(campoId) && ((percentConformeSelect.getOrDefault(campoId, 0.0D) >= 80.0D)))).count();
            if (countAltaConformidade > 0L) {
                categoriasFortes.add(String.format("%s: %d itens com alta conformidade", categoria, countAltaConformidade));
            }
        }

        if (!categoriasFortes.isEmpty()) {
            pontos.addAll(categoriasFortes);
        }

        return pontos;
    }


    public static List<String> calcularPontosCriticos(List<FormResponse> forms, List<RespostaResponse> respostas, VisitaResponse visita) {
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

        Stream.concat(percentTruePorCampo
                        .entrySet().stream(), percentConformeSelect
                        .entrySet().stream())

                .min(Map.Entry.comparingByValue())
                .ifPresent(entry -> {
                    Long campoId = entry.getKey();


                    Double pct = entry.getValue();


                    CamposFormResponse campo = camposById.get(campoId);


                    String label = buildCampoLabel(campo, forms);


                    int count = countsPorCampo.getOrDefault(campoId, countsPorCampoSelect.getOrDefault(campoId, 0));


                    criticos.add(String.format("Pior campo: %s (%.1f%% conformidade, %d respostas)", label, pct, count));
                });


        List<String> camposCriticos = Stream.concat(percentTruePorCampo.entrySet().stream(), percentConformeSelect.entrySet().stream()).filter(e -> (e.getValue() <= 20.0D)).filter(e -> {
            int count = countsPorCampo.getOrDefault(e.getKey(), countsPorCampoSelect.getOrDefault(e.getKey(), 0));
            return (count > 0);
        }).sorted(Map.Entry.comparingByValue()).map(e -> {
            CamposFormResponse campo = camposById.get(e.getKey());
            String label = buildCampoLabel(campo, forms);
            int count = countsPorCampo.getOrDefault(e.getKey(), countsPorCampoSelect.getOrDefault(e.getKey(), 0));
            return String.format("%s (%.1f%% conformidade, %d respostas)", label, e.getValue(), count);
        }).toList();

        if (!camposCriticos.isEmpty()) {
            criticos.addAll(camposCriticos);
        }

        return criticos.isEmpty() ? List.of("Nenhum ponto crítico identificado") : criticos;
    }

    public static Map<String, CategoryConformanceDTO> calcularConformidadesDetalhadas(List<FormResponse> forms, List<RespostaResponse> respostas, VisitaResponse visita) {
        Map<String, CategoryConformanceDTO> mapa = new HashMap<>();
        if (forms == null || respostas == null) return mapa;

        ResultadosHierarquicos resultados = calcularConformidadeHierarquica(forms, respostas, visita);

        for (FormResponse form : forms) {
            if (form == null)
                continue;
            ResultadosHierarquicos.PorFormulario formData = resultados.porFormulario.get(form.id());

            if (formData == null) {

                mapa.put(form.categoria(), new CategoryConformanceDTO(form.categoria(), -1.0D, 0.0D, 0.0D, 0.0D));

                continue;
            }
            double mediaTrue = formData.porcentagem;
            double mediaFalse = 0.0D;
            double mediaNot = 0.0D;
            double percCamposFora = 0.0D;

            mapa.put(form.categoria(), new CategoryConformanceDTO(form.categoria(), mediaTrue, mediaFalse, mediaNot, percCamposFora));
        }

        return mapa;
    }


    public static double percentualItensForaConformidadeGlobal(List<FormResponse> forms, List<RespostaResponse> respostas) {
        if (forms == null || respostas == null) return 0.0D;

        GenericPercentResult gen = calcularPercentuaisGenericosPorCampo(forms, respostas);
        Set<Long> todos = new HashSet<>();
        todos.addAll(gen.percentTrueByCampo.keySet());
        todos.addAll(gen.percentConformeByCampo.keySet());

        if (todos.isEmpty()) return 0.0D;


        long fora = todos.stream().filter(id -> {
            Double t = gen.percentTrueByCampo.get(id);
            if (t != null) return (t < 80.0D);
            Double s = gen.percentConformeByCampo.get(id);
            return (s != null && s < 80.0D);
        }).count();

        return (double) fora / todos.size() * 100.0D;
    }


    private static GenericPercentResult calcularPercentuaisGenericosPorCampo(List<FormResponse> forms, List<RespostaResponse> respostas) {
        GenericPercentResult res = new GenericPercentResult();
        if (forms == null || respostas == null) return res;


        Set<Long> campoIds = forms.stream()
                .flatMap(f -> Optional.ofNullable(f.campos()).orElse(List.of()).stream())
                .map(CamposFormEntity::getId)
                .collect(Collectors.toSet());

        for (Long campoId : campoIds) {


            List<RespostaResponse> rCampo = respostas.stream().filter(r -> (r.campoId() != null && r.campoId().equals(campoId))).toList();

            if (rCampo.isEmpty()) {
                continue;
            }

            boolean anyCheckbox = rCampo.stream().anyMatch(rr -> (rr.checkbox() != null));

            if (anyCheckbox) {


                long trueCount = rCampo.stream().map(RespostaResponse::checkbox).filter(Objects::nonNull).filter(cb -> (cb == CheckBox.TRUE)).count();


                long validCount = rCampo.stream().map(RespostaResponse::checkbox).filter(Objects::nonNull).filter(cb -> (cb == CheckBox.TRUE || cb == CheckBox.FALSE)).count();

                if (validCount > 0L) {
                    double pct = (double) trueCount / validCount * 100.0D;
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
                .collect(Collectors.toMap(CamposFormEntity::getId, FormMapper::toCampoResponse));
    }

    private static String buildCampoLabel(CamposFormResponse campo, List<FormResponse> forms) {
        if (campo == null) return "Campo desconhecido";
        String categoria = getCategoriaDoCampo(campo, forms);
        return categoria + " - " + categoria;
    }

    private static String getCategoriaDoCampo(CamposFormResponse campo, List<FormResponse> forms) {
        if (campo == null) return "Sem categoria";

        for (FormResponse form : forms) {
            if (form != null &&
                    form.campos() != null && form.campos().stream()
                    .filter(Objects::nonNull)
                    .anyMatch(c -> (c.getId() != null && c.getId().equals(campo.id())))) {
                return form.categoria();
            }
        }
        return "Sem categoria";
    }
}