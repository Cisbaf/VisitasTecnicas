package com.avaliacaoservice.relatorio.service;

import com.avaliacaoservice.base.entity.BaseResponse;
import com.avaliacaoservice.base.service.capsule.BaseService;
import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import com.avaliacaoservice.form.entity.dto.resposta.RespostaResponse;
import com.avaliacaoservice.form.service.capsule.FormService;
import com.avaliacaoservice.form.service.capsule.RespostaService;
import com.avaliacaoservice.inspecao.entity.dto.VtrMediaDto;
import com.avaliacaoservice.inspecao.service.CidadeService;
import com.avaliacaoservice.inspecao.service.CsvProcessingService;
import com.avaliacaoservice.relatorio.entity.*;
import com.avaliacaoservice.viatura.entity.ViaturaResponse;
import com.avaliacaoservice.viatura.service.capsule.ViaturaService;
import com.avaliacaoservice.visita.entity.EquipeTecnica;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaResponse;
import com.avaliacaoservice.visita.service.capsule.VisitaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.*;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RelatorioTecnicoService {

    private final BaseService baseService;
    private final VisitaService visitaService;
    private final FormService formService;
    private final RespostaService respostaService;
    private final ViaturaService viaturaService;
    private final CidadeService inspecaoServiceClient;
    private final CsvProcessingService csvProcessingService;

    public RelatorioTecnicoResponse gerarRelatorio(Long visitaId, LocalDate dataInicio, LocalDate dataFim) {
        log.info("Iniciando geração de relatório. visitaId={}, dataInicio={}, dataFim={}", visitaId, dataInicio, dataFim);
        try {
            VisitaResponse visita = this.visitaService.getById(visitaId);

            if (visita == null) {
                log.error("Visita não encontrada para o ID: {}", visitaId);
                throw new RuntimeException("Visita não encontrada para o ID: " + visitaId);
            }

            Long idBase = visita.idBase();
            if (idBase == null) {
                log.error("Visita sem idBase. visitaId={}", visitaId);
                throw new RuntimeException("Visita não possui ID da base: " + visitaId);
            }

            BaseResponse base = this.baseService.getById(idBase);

            if (base == null) {
                log.error("Base não encontrada para o ID: {}", idBase);
                throw new RuntimeException("Base não encontrada para o ID: " + idBase);
            }

            List<EquipeTecnica> equipe = this.visitaService.getAllMembrosByVisitaId(visitaId);
            var viaturas = this.viaturaService.getVeiculoFromApiByPeriodo(base.id(), dataInicio.toString(), dataFim.toString());

            List<FormResponse> forms = Optional.ofNullable(this.formService.getAll()).orElse(List.of());

            List<Long> campoIds = forms.stream()
                    .flatMap(form -> form.campos().stream())
                    .map(CamposFormEntity::getId)
                    .toList();
            List<RespostaResponse> respostas = List.of();
            try {
                respostas = respostaService.getRespostasByCampoIds(campoIds);
            } catch (Exception e) {
                // Log de aviso é importante aqui, pois o relatório continua, mas pode estar incompleto
                log.warn("Erro buscando respostas por campoIds (continuando sem respostas). visitaId={}, erro={}", visitaId, e.getMessage());
            }

            List<VtrMediaDto> vtrMediaList = Optional.ofNullable(this.inspecaoServiceClient.getVtrMedia()).orElse(List.of());
            HashMap<String, String> prontidaoMedia = new HashMap<>();
            try {
                prontidaoMedia = this.csvProcessingService.calcularMediaProntidao();
            } catch (Exception e) {
                log.warn("Erro calculando média prontidão (continuando). visitaId={}, erro={}", visitaId, e.getMessage());
            }
            HashMap<String, String> temposMedia = new HashMap<>();
            try {
                temposMedia = this.inspecaoServiceClient.getCidadesTempoMedia();
            } catch (Exception e) {
                log.warn("Erro obtendo tempos médios (continuando). visitaId={}, erro={}", visitaId, e.getMessage());
            }

            return processarRelatorio(visita, base, equipe, viaturas, forms, respostas, vtrMediaList, prontidaoMedia, temposMedia);
        } catch (Exception e) {
            log.error("Erro ao gerar relatório para visitaId={}: {}", visitaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao processar dados da visita: " + visitaId, e);
        }
    }


    private RelatorioTecnicoResponse processarRelatorio(VisitaResponse visita, BaseResponse base, List<EquipeTecnica> equipe, List<ViaturaResponse> viaturas, List<FormResponse> forms, List<RespostaResponse> respostas, List<VtrMediaDto> vtrMediaList, HashMap<String, String> prontidaoMedia, HashMap<String, String> temposMedia) {
        // log.debug removido
        try {
            RelatorioTecnicoResponse relatorio = new RelatorioTecnicoResponse();

            relatorio.setVisitaId(visita.id());
            relatorio.setDataVisita(visita.dataVisita());
            relatorio.setBaseNome(base.nome());
            relatorio.setMunicipio(base.endereco());

            relatorio.setEquipe(Optional.ofNullable(equipe)
                    .orElse(Collections.emptyList())
                    .stream()
                    .filter(Objects::nonNull)
                    .map(m -> new MembroDTO(m.getNome(), m.getCargo()))
                    .collect(Collectors.toList()));

            List<FormResponse> safeForms = Optional.ofNullable(forms).orElse(Collections.emptyList());
            List<RespostaResponse> safeRespostas = Optional.ofNullable(respostas).orElse(Collections.emptyList());
            List<ViaturaResponse> safeViaturas = Optional.ofNullable(viaturas).orElse(Collections.emptyList());

            CalcularPontos.ResultadosHierarquicos resultadosHierarquicos = CalcularPontos.calcularConformidadeHierarquica(safeForms, safeRespostas, visita);

            double mediaConformidadeVisita = resultadosHierarquicos.geral.porcentagem;
            relatorio.setMediaGeralConformidade(mediaConformidadeVisita);

            relatorio.setPontosFortes(CalcularPontos.calcularPontosFortes(safeForms, safeRespostas, visita));
            relatorio.setPontosCriticos(CalcularPontos.calcularPontosCriticos(safeForms, safeRespostas, visita));

            Map<String, CategoryConformanceDTO> confDetalhada = CalcularPontos.calcularConformidadesDetalhadas(safeForms, safeRespostas, visita);
            relatorio.setConformidadeDetalhada(confDetalhada);

            Map<String, Double> conformidadesSimples = new HashMap<>();

            for (Map.Entry<Long, CalcularPontos.ResultadosHierarquicos.PorFormulario> entry : resultadosHierarquicos.porFormulario.entrySet()) {

                Long formId = entry.getKey();
                CalcularPontos.ResultadosHierarquicos.PorFormulario formData = entry.getValue();

                Optional<FormResponse> formOpt = safeForms.stream().filter(f -> f.id().equals(formId)).findFirst();

                if (formOpt.isPresent()) {
                    String categoria = formOpt.get().categoria();
                    conformidadesSimples.put(categoria, formData.porcentagem);
                } else {
                    log.warn("Formulário não encontrado para ID {} ao calcular conformidades simples.", formId);
                }
            }
            relatorio.setConformidades(conformidadesSimples);

            Map<Long, Double> conformidadesPorSummary = new HashMap<>();

            for (Map.Entry<Long, CalcularPontos.ResultadosHierarquicos.PorSummary> entry : resultadosHierarquicos.porSummary.entrySet()) {
                conformidadesPorSummary.put(entry.getKey(), entry.getValue().porcentagem);
            }
            relatorio.setConformidadesPorSummary(conformidadesPorSummary);

            double percentualFora = CalcularPontos.percentualItensForaConformidadeGlobal(safeForms, safeRespostas);
            relatorio.setPercentualItensForaConformidade(percentualFora);

            relatorio.setViaturas(processarViaturas(safeViaturas));

            String baseNomeNormalizado = normalizarNome(base.nome());

            Optional<VtrMediaDto> vtrBase = vtrMediaList.stream().filter(vtr -> normalizarNome(vtr.cidade()).equals(baseNomeNormalizado)).findFirst();

            relatorio.setPorcentagemVtrAtiva(vtrBase.map(VtrMediaDto::ativa).orElse(null));
            relatorio.setTempoMedioProntidao(prontidaoMedia.get(base.nome()));
            relatorio.setTempoMedioAtendimento(temposMedia.get(base.nome()));

            return relatorio;
        } catch (Exception e) {
            log.error("Erro processando relatorio interno para visitaId={}: {}", visita != null ? visita.id() : null, e.getMessage(), e);
            throw new RuntimeException("Erro ao processar relatório interno", e);
        }
    }


    private List<ViaturaDTO> processarViaturas(List<ViaturaResponse> viaturas) {
        try {
            if (viaturas == null || viaturas.isEmpty()) {
                return List.of();
            }
            return viaturas.stream().map(v -> {
                ViaturaDTO dto = new ViaturaDTO();
                dto.setPlaca(v.getPlaca());
                dto.setTipoViatura(v.getTipoViatura());
                dto.setKm(v.getKm());
                dto.setDataUltimaAlteracao(v.getDataUltimaAlteracao());
                return dto;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erro processando viaturas: {}", e.getMessage(), e);
            return List.of();
        }
    }


    public RelatorioConsolidadoResponse gerarRelatoriosPorPeriodIdBase(Long idBase, LocalDate dataInicio, LocalDate dataFim) {
        log.info("Gerando relatorios por base. idBase={}, dataInicio={}, dataFim={}", idBase, dataInicio, dataFim);
        RelatorioTecnicoResponse rel;
        List<VisitaResponse> visitas = Optional.ofNullable(this.visitaService.getBaseByPeriod(idBase, dataInicio, dataFim)).orElse(List.of());

        List<VisitaResponse> visitasValidas = visitas.stream().filter(Objects::nonNull).filter(v -> (v.idBase() != null && v.dataVisita() != null && v.id() != null)).filter(v -> (v.tipoVisita() == null || v.tipoVisita().isEmpty() || v.tipoVisita().toUpperCase().contains("INSPECAO"))).toList();

        int totalVisitasPeriodo = visitasValidas.size();

        VisitaResponse ultimaVisita = visitasValidas.stream().max(Comparator.comparing(VisitaResponse::dataVisita)).orElse(null);

        if (ultimaVisita == null) {
            return consolidarRelatorios(List.of(), dataInicio, dataFim, totalVisitasPeriodo);
        }

        try {
            rel = gerarRelatorio(ultimaVisita.id(), dataInicio, dataFim);
        } catch (Exception e) {
            log.warn("Falha ao gerar relatório para ultima visita id={} da base {}: {}", ultimaVisita.id(), idBase, e.getMessage());
            return consolidarRelatorios(List.of(), dataInicio, dataFim, totalVisitasPeriodo);
        }

        return consolidarRelatorios(
                (rel != null) ? List.of(rel) : List.of(), dataInicio, dataFim, totalVisitasPeriodo);
    }


    public List<RelatorioTecnicoResponse> gerarRelatoriosPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        log.info("Gerando relatorios por periodo. dataInicio={}, dataFim={}", dataInicio, dataFim);
        List<VisitaResponse> visitas = Optional.ofNullable(this.visitaService.getAllByPeriod(dataInicio, dataFim)).orElse(List.of());

        List<VisitaResponse> visitasValidas = visitas.stream().filter(Objects::nonNull).filter(v -> (v.idBase() != null && v.dataVisita() != null && v.id() != null)).filter(v -> (v.tipoVisita() == null || v.tipoVisita().isEmpty() || v.tipoVisita().toUpperCase().contains("INSPECAO"))).toList();

        Map<Long, VisitaResponse> ultimaPorBase = visitasValidas.stream().collect(Collectors.toMap(VisitaResponse::idBase, Function.identity(), BinaryOperator.maxBy(Comparator.comparing(VisitaResponse::dataVisita))));

        return ultimaPorBase.values().stream()
                .map(visita -> {
                    try {
                        return gerarRelatorio(visita.id(), dataInicio, dataFim);
                    } catch (Exception e) {
                        log.warn("Erro ao gerar relatório para visita id={}: {}", visita.id(), e.getMessage());
                        return null;
                    }
                }).filter(Objects::nonNull)
                .collect(Collectors.toList());
    }


    private RelatorioConsolidadoResponse consolidarRelatorios(List<RelatorioTecnicoResponse> relatorios, LocalDate dataInicio, LocalDate dataFim, int totalVisitasPeriodo) {
        RelatorioConsolidadoResponse consolidado = new RelatorioConsolidadoResponse();

        consolidado.setDataInicio(dataInicio);
        consolidado.setDataFim(dataFim);

        consolidado.setTotalVisitas(totalVisitasPeriodo);

        consolidado.setPontosFortes(relatorios.stream()
                .flatMap(r -> r.getPontosFortes().stream())
                .distinct()
                .collect(Collectors.toList()));

        Map<String, Long> contagemCriticos = relatorios.stream().flatMap(r -> r.getPontosCriticos().stream()).collect(Collectors.groupingBy(ponto -> ponto,

                Collectors.counting()));

        consolidado.setPontosCriticosGerais(
                contagemCriticos.entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .map(entry -> new PontoCriticoDTO(entry.getKey(), entry.getValue()))
                        .collect(Collectors.toList())
        );

        Map<Long, DoubleSummaryStatistics> statsPorSummary = relatorios.stream().flatMap(r -> r.getConformidadesPorSummary().entrySet().stream()).collect(Collectors.groupingBy(Map.Entry::getKey,

                Collectors.summarizingDouble(Map.Entry::getValue)));

        Map<Long, Double> mediasConformidadePorSummary = new HashMap<>();
        statsPorSummary.forEach((summaryId, stats) -> mediasConformidadePorSummary.put(summaryId, stats.getAverage()));

        consolidado.setConformidadesPorSummary(mediasConformidadePorSummary);

        Map<String, DoubleSummaryStatistics> statsPorCategoria = relatorios.stream().flatMap(r -> r.getConformidades().entrySet().stream()).collect(Collectors.groupingBy(Map.Entry::getKey,

                Collectors.summarizingDouble(Map.Entry::getValue)));

        Map<String, Double> mediasConformidade = new HashMap<>();
        statsPorCategoria.forEach((categoria, stats) -> mediasConformidade.put(categoria, stats.getAverage()));

        consolidado.setMediasConformidade(mediasConformidade);

        Map<String, ViaturaDTO> viaturasUnicas = relatorios.stream().flatMap(r -> r.getViaturas().stream()).collect(Collectors.toMap(ViaturaDTO::getPlaca, v -> v, (v1, v2) -> v1));

        consolidado.setViaturasCriticas(new ArrayList<>(viaturasUnicas.values()));

        consolidado.setRankingBases(getRankingBasesPeriodoAtual(dataInicio, dataFim));
        List<BaseRankingDTO> ranking = getRankingBasesPeriodoAtual(dataInicio, dataFim);

        List<BaseMetricasExternasDTO> metricasExternas = ranking.stream().map(base -> {
            BaseMetricasExternasDTO metricas = new BaseMetricasExternasDTO();
            metricas.setBaseNome(base.getNomeBase());
            metricas.setIdBase(base.getIdBase());
            metricas.setPorcentagemVtrAtiva(base.getPorcentagemVtrAtiva());
            metricas.setTempoMedioProntidao(base.getTempoMedioProntidao());
            metricas.setTempoMedioAtendimento(base.getTempoMedioAtendimento());
            metricas.setMediaConformidade(base.getMediaConformidade());
            return metricas;
        }).collect(Collectors.toList());

        consolidado.setMetricasExternasBases(metricasExternas);

        return consolidado;
    }

    public List<BaseRankingDTO> getRankingBasesPeriodoAtual(LocalDate dataInicio, LocalDate dataFim) {
        log.info("Calculando ranking de bases para periodo {} - {}", dataInicio, dataFim);
        List<BaseResponse> todasBases = Optional.ofNullable(this.baseService.getAll()).orElse(List.of());
        List<BaseRankingDTO> ranking = new ArrayList<>();

        List<VtrMediaDto> vtrMediaList = Optional.ofNullable(this.inspecaoServiceClient.getVtrMedia()).orElse(List.of());
        Map<String, Double> vtrMediaMap = vtrMediaList.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(v -> normalizarNome(v.cidade()), VtrMediaDto::ativa, (a, b) -> a));

        Map<String, String> prontidaoMediaMap = Optional.ofNullable(this.csvProcessingService.calcularMediaProntidao())
                .orElse(new HashMap<>())
                .entrySet().stream()
                .collect(Collectors.toMap(e -> normalizarNome(e.getKey()), Map.Entry::getValue, (a, b) -> a));

        Map<String, String> temposMediaMap = Optional.ofNullable(this.inspecaoServiceClient.getCidadesTempoMedia())
                .orElse(new HashMap<>())
                .entrySet().stream()
                .collect(Collectors.toMap(e -> normalizarNome(e.getKey()), Map.Entry::getValue, (a, b) -> a));

        List<FormResponse> formsAll = Optional.ofNullable(this.formService.getAll()).orElse(List.of());

        for (BaseResponse base : todasBases) {
            try {
                List<VisitaResponse> visitas = Optional.ofNullable(this.visitaService.getBaseByPeriod(base.id(), dataInicio, dataFim)).orElse(List.of());
                if (visitas.isEmpty()) {
                    continue;
                }

                VisitaResponse ultimaVisita = visitas.stream()
                        .filter(Objects::nonNull)
                        .filter(v -> (v.dataVisita() != null && v.id() != null))
                        .max(Comparator.comparing(VisitaResponse::dataVisita).thenComparing(VisitaResponse::id))
                        .orElse(null);

                if (ultimaVisita == null) {
                    continue;
                }

               //Buscar forms da visita específica
                List<FormResponse> formsDaVisita = formsAll.stream()
                        .filter(form -> form.visitaId() != null && form.visitaId().equals(ultimaVisita.id()))
                        .toList();

                if (formsDaVisita.isEmpty()) {
                    continue;
                }

                // Coletar todos os campoIds dos forms da visita
                List<Long> todosCampoIds = formsDaVisita.stream()
                        .flatMap(form -> form.campos().stream())
                        .map(CamposFormEntity::getId)
                        .distinct()
                        .toList();

                // Buscar todas as respostas de uma vez
                List<RespostaResponse> respostasVisita = List.of();
                try {
                    respostasVisita = this.respostaService.getRespostasByCampoIds(todosCampoIds);
                } catch (Exception e) {
                    log.warn("Erro buscando respostas para base {} visita {}: {}. Continuando sem respostas.", base.nome(), ultimaVisita.id(), e.getMessage());
                }

                // Passar apenas os forms da visita específica
                CalcularPontos.ResultadosHierarquicos resultados = CalcularPontos.calcularConformidadeHierarquica(formsDaVisita, respostasVisita, ultimaVisita);

                double mediaConformidadeBase = resultados.geral.porcentagem;
                if (mediaConformidadeBase <= 0.0D) {
                    continue;
                }

                BaseRankingDTO dto = new BaseRankingDTO(base.nome(), base.id(), mediaConformidadeBase, ultimaVisita.dataVisita());
                String baseNomeNorm = normalizarNome(base.nome());

                Double vtrRaw = vtrMediaMap.get(baseNomeNorm);
                dto.setPorcentagemVtrAtiva(vtrRaw);
                dto.setTempoMedioProntidao(prontidaoMediaMap.get(baseNomeNorm));
                dto.setTempoMedioAtendimento(temposMediaMap.get(baseNomeNorm));

                double normConf = Math.max(0.0D, Math.min(1.0D, mediaConformidadeBase / 100.0D));
                double normVtr = normalizeVtrRaw(vtrRaw);

                Double prontMin = parseDurationToMinutes(prontidaoMediaMap.get(baseNomeNorm));
                Double atendMin = parseDurationToMinutes(temposMediaMap.get(baseNomeNorm));

                double normPront = normalizarTempo(prontMin);
                double normAtend = normalizarTempo(atendMin);

                double score = 0.25D * normConf + 0.25D * normVtr + 0.25D * normPront + 0.25D * normAtend;

                dto.setScore(score);
                ranking.add(dto);
            } catch (Exception e) {
                log.error("Erro processando base {}: {}", base != null ? base.nome() : null, e.getMessage(), e);
            }
        }

        ranking.sort(Comparator.comparing(BaseRankingDTO::getScore, Comparator.reverseOrder()));
        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).setPosicaoRanking(i + 1);
        }

        return ranking;
    }

    private double normalizarTempo(Double minutos) {
        if (minutos == null) return 0.5D;

        double tempoMaximo = 120.0D;

        if (minutos > tempoMaximo) return 0.1D;

        return 1.0D - minutos / tempoMaximo * 2.0D;
    }

    private static Double normalizeVtrRaw(Double v) {
        if (v == null) return 0.5D;
        if (v <= 1.0D) return v;
        if (v <= 100.0D) return v / 100.0D;
        return 0.5D;
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
                    return a * 60.0D + b;
                }
                if (parts.length == 3) {
                    int h = Integer.parseInt(parts[0]);
                    int m = Integer.parseInt(parts[1]);
                    int sec = Integer.parseInt(parts[2]);
                    return h * 60.0D + m + sec / 60.0D;
                }
            } else {
                return Double.parseDouble(s);
            }
        } catch (Exception ex) {
            log.warn("Não foi possível parsear duração '{}' para minutos: {}", s, ex.getMessage());
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