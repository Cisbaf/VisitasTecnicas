package com.relatorioservice.service;

import com.relatorioservice.entity.dtos.*;
import com.relatorioservice.entity.fora.Visita.EquipeTecnica;
import com.relatorioservice.entity.fora.Visita.VisitaEntity;
import com.relatorioservice.entity.fora.base.BaseEntity;
import com.relatorioservice.entity.fora.forms.dto.FormResponse;
import com.relatorioservice.entity.fora.forms.dto.RespostaResponse;
import com.relatorioservice.entity.fora.viatura.ViaturaEntity;
import com.relatorioservice.service.client.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelatorioTecnicoService {

    private final BaseServiceClient baseService;
    private final VisitaServiceClient visitaService;
    private final FormServiceClient formService;
    private final ViaturaServiceClient viaturaService;
    private final InspecaoServiceClient inspecaoServiceClient;


    public RelatorioTecnicoResponse gerarRelatorio(Long visitaId, LocalDate dataInicio, LocalDate dataFim) {
        try {
            VisitaEntity visita = visitaService.getVisitaById(visitaId);

            // Verificar se visita é null
            if (visita == null) {
                throw new RuntimeException("Visita não encontrada para o ID: " + visitaId);
            }

            // Verificar se getIdBase() pode retornar null
            Long idBase = visita.getIdBase();
            if (idBase == null) {
                throw new RuntimeException("Visita não possui ID da base: " + visitaId);
            }

            BaseEntity base = baseService.getBaseById(idBase);

            // Verificar se base é null
            if (base == null) {
                throw new RuntimeException("Base não encontrada para o ID: " + idBase);
            }

            List<EquipeTecnica> equipe = visitaService.getAllMembrosByVisitaId(visitaId);
            List<ViaturaEntity> viaturas = viaturaService.findByPeriodo(base.getId(), dataInicio.toString(), dataFim.toString());

            List<FormResponse> forms = Optional.ofNullable(formService.getAll()).orElse(List.of());
            List<RespostaResponse> respostas = Optional.ofNullable(formService.getRespostasByVisitaId(visitaId)).orElse(List.of());

            List<VtrMediaDto> vtrMediaList = inspecaoServiceClient.getVtrMedia();
            HashMap<String, String> prontidaoMedia = inspecaoServiceClient.getMediaProntidao();
            HashMap<String, String> temposMedia = inspecaoServiceClient.getMediaTempos();

            return processarRelatorio(visita, base, equipe, viaturas, forms, respostas, vtrMediaList, prontidaoMedia, temposMedia);

        } catch (NullPointerException e) {
            System.err.println("NullPointerException ao gerar relatório para visitaId: " + visitaId);
            throw new RuntimeException("Erro ao processar dados da visita: " + visitaId, e);
        }
    }


    private RelatorioTecnicoResponse processarRelatorio(VisitaEntity visita,
                                                        BaseEntity base,
                                                        List<EquipeTecnica> equipe,
                                                        List<ViaturaEntity> viaturas,
                                                        List<FormResponse> forms,
                                                        List<RespostaResponse> respostas,
                                                        List<VtrMediaDto> vtrMediaList,
                                                        HashMap<String, String> temposMedia,
                                                        HashMap<String, String> prontidaoMedia) {

        RelatorioTecnicoResponse relatorio = new RelatorioTecnicoResponse();

        relatorio.setVisitaId(visita.getId());
        relatorio.setDataVisita(visita.getDataVisita());
        relatorio.setBaseNome(base.getNome());
        relatorio.setMunicipio(base.getEndereco());

        relatorio.setEquipe(Optional.ofNullable(equipe)
                .orElse(Collections.emptyList())
                .stream()
                .filter(Objects::nonNull)
                .map(m -> new MembroDTO(m.getNome(), m.getCargo()))
                .collect(Collectors.toList()));

        List<FormResponse> safeForms = Optional.ofNullable(forms).orElse(Collections.emptyList());
        List<RespostaResponse> safeRespostas = Optional.ofNullable(respostas).orElse(Collections.emptyList());
        List<ViaturaEntity> safeViaturas = Optional.ofNullable(viaturas).orElse(Collections.emptyList());

        CalcularPontos.ResultadosHierarquicos resultadosHierarquicos =
                CalcularPontos.calcularConformidadeHierarquica(safeForms, safeRespostas, visita);

        double mediaConformidadeVisita = resultadosHierarquicos.geral.porcentagem;
        relatorio.setMediaGeralConformidade(mediaConformidadeVisita);

        relatorio.setPontosFortes(CalcularPontos.calcularPontosFortes(safeForms, safeRespostas, visita));
        relatorio.setPontosCriticos(CalcularPontos.calcularPontosCriticos(safeForms, safeRespostas, visita));

        Map<String, CategoryConformanceDTO> confDetalhada = CalcularPontos.calcularConformidadesDetalhadas(safeForms, safeRespostas, visita);
        relatorio.setConformidadeDetalhada(confDetalhada);

        // Construir o map de conformidades por categoria (mantido para compatibilidade)
        Map<String, Double> conformidadesSimples = new HashMap<>();
        for (Map.Entry<Long, CalcularPontos.ResultadosHierarquicos.PorFormulario> entry :
                resultadosHierarquicos.porFormulario.entrySet()) {

            Long formId = entry.getKey();
            CalcularPontos.ResultadosHierarquicos.PorFormulario formData = entry.getValue();

            Optional<FormResponse> formOpt = safeForms.stream()
                    .filter(f -> f.id().equals(formId))
                    .findFirst();

            if (formOpt.isPresent()) {
                String categoria = formOpt.get().categoria();
                conformidadesSimples.put(categoria, formData.porcentagem);
            }
        }
        relatorio.setConformidades(conformidadesSimples);

        // NOVO: Construir o map de conformidades por summary
        Map<Long, Double> conformidadesPorSummary = new HashMap<>();
        for (Map.Entry<Long, CalcularPontos.ResultadosHierarquicos.PorSummary> entry :
                resultadosHierarquicos.porSummary.entrySet()) {
            conformidadesPorSummary.put(entry.getKey(), entry.getValue().porcentagem);
        }
        relatorio.setConformidadesPorSummary(conformidadesPorSummary);

        double percentualFora = CalcularPontos.percentualItensForaConformidadeGlobal(safeForms, safeRespostas);
        relatorio.setPercentualItensForaConformidade(percentualFora);

        relatorio.setViaturas(processarViaturas(safeViaturas));

        String baseNomeNormalizado = normalizarNome(base.getNome());

        Optional<VtrMediaDto> vtrBase = vtrMediaList.stream()
                .filter(vtr -> normalizarNome(vtr.getCidade()).equals(baseNomeNormalizado))
                .findFirst();

        relatorio.setPorcentagemVtrAtiva(vtrBase.map(VtrMediaDto::getAtiva).orElse(null));
        relatorio.setTempoMedioProntidao(prontidaoMedia.get(base.getNome()));
        relatorio.setTempoMedioAtendimento(temposMedia.get(base.getNome()));

        return relatorio;
    }


    private List<ViaturaDTO> processarViaturas(List<ViaturaEntity> viaturas) {
        return viaturas.stream().map(v -> {
            ViaturaDTO dto = new ViaturaDTO();
            dto.setPlaca(v.getPlaca());
            dto.setTipoViatura(v.getTipoViatura());
            dto.setKm(v.getKm());
            dto.setDataUltimaAlteracao(v.getDataUltimaAlteracao());
            return dto;
        }).collect(Collectors.toList());
    }

    public RelatorioConsolidadoResponse gerarRelatoriosPorPeriodIdBase(Long idBase, LocalDate dataInicio, LocalDate dataFim) {
        List<VisitaEntity> visitas = Optional.ofNullable(
                visitaService.getBaseByPeriodAndBaseId(idBase, dataInicio, dataFim)
        ).orElse(List.of());

        // escolher a última visita pela dataVisita
        VisitaEntity ultimaVisita = visitas.stream()
                .filter(Objects::nonNull)
                .filter(v -> v.getDataVisita() != null && v.getId() != null)
                .max(Comparator.comparing(VisitaEntity::getDataVisita))
                .orElse(null);

        if (ultimaVisita == null) {
            // nenhuma visita válida encontrada -> consolidar vazio
            return consolidarRelatorios(List.of(), dataInicio, dataFim);
        }

        RelatorioTecnicoResponse rel;
        try {
            rel = this.gerarRelatorio(ultimaVisita.getId(), dataInicio, dataFim);
        } catch (Exception e) {
            return consolidarRelatorios(List.of(), dataInicio, dataFim);
        }

        return consolidarRelatorios(rel != null ? List.of(rel) : List.of(), dataInicio, dataFim);
    }

    public List<RelatorioTecnicoResponse> gerarRelatoriosPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        List<VisitaEntity> visitas = Optional.ofNullable(
                visitaService.getAllByPeriod(dataInicio, dataFim)
        ).orElse(List.of());

        // agrupa por idBase e pega a última visita de cada base
        Map<Long, Optional<VisitaEntity>> ultimaPorBase = visitas.stream()
                .filter(Objects::nonNull)
                .filter(v -> v.getIdBase() != null && v.getDataVisita() != null && v.getId() != null)
                .collect(Collectors.groupingBy(
                        VisitaEntity::getIdBase,
                        Collectors.maxBy(Comparator.comparing(VisitaEntity::getDataVisita))
                ));

        return ultimaPorBase.values().stream()
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(visita -> {
                    try {
                        return this.gerarRelatorio(visita.getId(), dataInicio, dataFim);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private RelatorioConsolidadoResponse consolidarRelatorios(
            List<RelatorioTecnicoResponse> relatorios,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        RelatorioConsolidadoResponse consolidado = new RelatorioConsolidadoResponse();

        consolidado.setDataInicio(dataInicio);
        consolidado.setDataFim(dataFim);
        consolidado.setTotalVisitas(relatorios.size());

        consolidado.setPontosFortes(relatorios.stream()
                .flatMap(r -> r.getPontosFortes().stream())
                .distinct()
                .collect(Collectors.toList()));

        Map<String, Long> contagemCriticos = relatorios.stream()
                .flatMap(r -> r.getPontosCriticos().stream())
                .collect(Collectors.groupingBy(
                        ponto -> ponto,
                        Collectors.counting()
                ));

        consolidado.setPontosCriticosGerais(
                contagemCriticos.entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .map(entry -> new PontoCriticoDTO(entry.getKey(), entry.getValue()))
                        .collect(Collectors.toList())
        );

        // NOVO: Calcular médias por summary em vez de por categoria
        Map<Long, DoubleSummaryStatistics> statsPorSummary = relatorios.stream()
                .flatMap(r -> r.getConformidadesPorSummary().entrySet().stream())
                .collect(Collectors.groupingBy(
                        Map.Entry::getKey,
                        Collectors.summarizingDouble(Map.Entry::getValue)
                ));

        Map<Long, Double> mediasConformidadePorSummary = new HashMap<>();
        statsPorSummary.forEach((summaryId, stats) ->
                mediasConformidadePorSummary.put(summaryId, stats.getAverage())
        );

        consolidado.setConformidadesPorSummary(mediasConformidadePorSummary);

        // Mantido para compatibilidade (se necessário)
        Map<String, DoubleSummaryStatistics> statsPorCategoria = relatorios.stream()
                .flatMap(r -> r.getConformidades().entrySet().stream())
                .collect(Collectors.groupingBy(
                        Map.Entry::getKey,
                        Collectors.summarizingDouble(Map.Entry::getValue)
                ));

        Map<String, Double> mediasConformidade = new HashMap<>();
        statsPorCategoria.forEach((categoria, stats) ->
                mediasConformidade.put(categoria, stats.getAverage())
        );

        consolidado.setMediasConformidade(mediasConformidade);

        // Agrupar viaturas por placa para remover duplicatas
        Map<String, ViaturaDTO> viaturasUnicas = relatorios.stream()
                .flatMap(r -> r.getViaturas().stream())
                .collect(Collectors.toMap(
                        ViaturaDTO::getPlaca,
                        v -> v,
                        (v1, v2) -> v1
                ));

        consolidado.setViaturasCriticas(new ArrayList<>(viaturasUnicas.values()));

        consolidado.setRankingBases(getRankingBasesPeriodoAtual(dataInicio, dataFim));
        List<BaseRankingDTO> ranking = getRankingBasesPeriodoAtual(dataInicio, dataFim);

        List<BaseMetricasExternasDTO> metricasExternas = ranking.stream()
                .map(base -> {
                    BaseMetricasExternasDTO metricas = new BaseMetricasExternasDTO();
                    metricas.setBaseNome(base.getNomeBase());
                    metricas.setIdBase(base.getIdBase());
                    metricas.setPorcentagemVtrAtiva(base.getPorcentagemVtrAtiva());
                    metricas.setTempoMedioProntidao(base.getTempoMedioProntidao());
                    metricas.setTempoMedioAtendimento(base.getTempoMedioAtendimento());
                    metricas.setMediaConformidade(base.getMediaConformidade());
                    return metricas;
                })
                .collect(Collectors.toList());

        consolidado.setMetricasExternasBases(metricasExternas);

        return consolidado;
    }

    public List<BaseRankingDTO> getRankingBasesPeriodoAtual(LocalDate dataInicio, LocalDate dataFim) {
        List<BaseEntity> todasBases = baseService.getAllBases();
        List<BaseRankingDTO> ranking = new ArrayList<>();

        // Dados externos (uma vez)
        List<VtrMediaDto> vtrMediaList = Optional.ofNullable(inspecaoServiceClient.getVtrMedia()).orElse(List.of());
        Map<String, Double> vtrMediaMap = vtrMediaList.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(v -> normalizarNome(v.getCidade()), VtrMediaDto::getAtiva, (a, b) -> a));

        Map<String, String> prontidaoMediaMap = Optional.ofNullable(inspecaoServiceClient.getMediaProntidao())
                .orElse(new HashMap<>()).entrySet().stream()
                .collect(Collectors.toMap(e -> normalizarNome(e.getKey()), Map.Entry::getValue, (a, b) -> a));

        Map<String, String> temposMediaMap = Optional.ofNullable(inspecaoServiceClient.getMediaTempos())
                .orElse(new HashMap<>()).entrySet().stream()
                .collect(Collectors.toMap(e -> normalizarNome(e.getKey()), Map.Entry::getValue, (a, b) -> a));

        List<FormResponse> formsAll = Optional.ofNullable(formService.getAll()).orElse(List.of());

        // TODAS AS MÉTRICAS COM MESMO PESO (0,25 cada)
        final double pesoConformidade = 0.25;
        final double pesoVtrAtiva = 0.25;
        final double pesoProntidao = 0.25;
        final double pesoAtendimento = 0.25;

        for (BaseEntity base : todasBases) {
            try {
                List<VisitaEntity> visitas = Optional.ofNullable(
                        visitaService.getBaseByPeriodAndBaseId(base.getId(), dataInicio, dataFim)
                ).orElse(List.of());
                if (visitas.isEmpty()) continue;

                VisitaEntity ultimaVisita = visitas.stream()
                        .filter(Objects::nonNull)
                        .filter(v -> v.getDataVisita() != null && v.getId() != null)
                        .max(Comparator.comparing(VisitaEntity::getDataVisita).thenComparing(VisitaEntity::getId))
                        .orElse(null);
                if (ultimaVisita == null) continue;

                List<RespostaResponse> respostasVisita = Optional.ofNullable(
                        formService.getRespostasByVisitaId(ultimaVisita.getId())
                ).orElse(List.of());

                CalcularPontos.ResultadosHierarquicos resultados =
                        CalcularPontos.calcularConformidadeHierarquica(formsAll, respostasVisita, ultimaVisita);

                double mediaConformidadeBase = resultados.geral.porcentagem;
                if (mediaConformidadeBase <= 0) continue;

                BaseRankingDTO dto = new BaseRankingDTO(base.getNome(), base.getId(), mediaConformidadeBase, ultimaVisita.getDataVisita());
                String baseNomeNorm = normalizarNome(base.getNome());

                Double vtrRaw = vtrMediaMap.get(baseNomeNorm);
                dto.setPorcentagemVtrAtiva(vtrRaw);
                dto.setTempoMedioProntidao(prontidaoMediaMap.get(baseNomeNorm));
                dto.setTempoMedioAtendimento(temposMediaMap.get(baseNomeNorm));

                // Normalizações para escala 0-1
                double normConf = Math.max(0.0, Math.min(1.0, mediaConformidadeBase / 100.0));
                double normVtr = normalizeVtrRaw(vtrRaw);

                Double prontMin = parseDurationToMinutes(prontidaoMediaMap.get(baseNomeNorm));
                Double atendMin = parseDurationToMinutes(temposMediaMap.get(baseNomeNorm));

                // Para tempos: menor é melhor, então invertemos a escala
                // Usamos uma função que dá score mais alto para tempos menores
                double normPront = normalizarTempo(prontMin);
                double normAtend = normalizarTempo(atendMin);

                // Cálculo do score com pesos iguais
                double score = (pesoConformidade * normConf) +
                        (pesoVtrAtiva * normVtr) +
                        (pesoProntidao * normPront) +
                        (pesoAtendimento * normAtend);

                dto.setScore(score);

                ranking.add(dto);

            } catch (Exception e) {
                System.err.println(e.getMessage());
            }
        }

        // ordenar por score (compareTo agora usa score quando presente) e setar posição
        ranking.sort(null);
        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).setPosicaoRanking(i + 1);
        }

        return ranking;
    }

    private double normalizarTempo(Double minutos) {
        if (minutos == null) return 0.5;

        // Definir um tempo máximo razoável (ex: 120 minutos = 2 horas)
        // Tempos menores que isso recebem scores mais altos
        double tempoMaximo = 120.0;

        // Se o tempo for maior que o máximo, score mínimo
        if (minutos > tempoMaximo) return 0.1;

        // Função decrescente: quanto menor o tempo, maior o score
        // Score vai de ~0.5 (para 60min) até 1.0 (para 0min)
        return 1.0 - (minutos / (tempoMaximo * 2));
    }

    private static Double normalizeVtrRaw(Double v) {
        if (v == null) return 0.5;
        if (v <= 1.0) return v;
        if (v <= 100.0) return v / 100.0;
        return 0.5;
    }

    private static Double parseDurationToMinutes(String s) {
        if (s == null) return null;
        s = s.trim();
        try {
            if (s.contains(":")) {
                String[] parts = s.split(":");
                if (parts.length == 2) {
                    int a = Integer.parseInt(parts[0]);
                    int b = Integer.parseInt(parts[1]);
                    return a * 60.0 + b;
                } else if (parts.length == 3) {
                    int h = Integer.parseInt(parts[0]);
                    int m = Integer.parseInt(parts[1]);
                    int sec = Integer.parseInt(parts[2]);
                    return h * 60.0 + m + sec / 60.0;
                }
            } else {
                return Double.parseDouble(s);
            }
        } catch (Exception ex) {
            return null;
        }
        return null;
    }



    private String normalizarNome(String nome) {
        if (nome == null) return "";
        String s = nome.trim().toUpperCase(Locale.forLanguageTag("pt-BR"));
        s = Normalizer.normalize(s, Normalizer.Form.NFD);
        s = s.replaceAll("\\p{M}", "");
        s = s.replaceAll("\\s+", " ");
        return s;
    }

}