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


    public RelatorioTecnicoResponse gerarRelatorio(Long visitaId) {
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
            List<ViaturaEntity> viaturas = viaturaService.getViaturasByBase(base.getId());

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
                                                        List<VtrMediaDto>vtrMediaList,
                                                        HashMap<String, String> temposMedia,
                                                        HashMap<String, String> prontidaoMedia)
    {

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

        // Garantir que as listas não sejam nulas antes de passar para CalcularPontos
        List<FormResponse> safeForms = Optional.ofNullable(forms).orElse(Collections.emptyList());
        List<RespostaResponse> safeRespostas = Optional.ofNullable(respostas).orElse(Collections.emptyList());
        List<ViaturaEntity> safeViaturas = Optional.ofNullable(viaturas).orElse(Collections.emptyList());

        CalcularPontos.ResultadosHierarquicos resultadosHierarquicos =
                CalcularPontos.calcularConformidadeHierarquica(safeForms, safeRespostas);

        // Calcular média de conformidade da visita
        double mediaConformidadeVisita = resultadosHierarquicos.geral.porcentagem;

        // Usar os métodos existentes para pontos fortes e críticos
        relatorio.setPontosFortes(CalcularPontos.calcularPontosFortes(safeForms, safeRespostas));
        relatorio.setPontosCriticos(CalcularPontos.calcularPontosCriticos(safeForms, safeRespostas));

        // Usar a nova lógica para conformidade detalhada
        Map<String, CategoryConformanceDTO> confDetalhada = CalcularPontos.calcularConformidadesDetalhadas(safeForms, safeRespostas);
        relatorio.setConformidadeDetalhada(confDetalhada);

        // Construir o map de conformidades simples a partir dos resultados hierárquicos
        Map<String, Double> conformidadesSimples = new HashMap<>();
        for (Map.Entry<Long, CalcularPontos.ResultadosHierarquicos.PorFormulario> entry :
                resultadosHierarquicos.porFormulario.entrySet()) {

            Long formId = entry.getKey();
            CalcularPontos.ResultadosHierarquicos.PorFormulario formData = entry.getValue();

            // Encontrar o formulário para obter a categoria
            Optional<FormResponse> formOpt = safeForms.stream()
                    .filter(f -> f.id().equals(formId))
                    .findFirst();

            if (formOpt.isPresent()) {
                String categoria = formOpt.get().categoria();
                conformidadesSimples.put(categoria, formData.porcentagem);
            }
        }

        relatorio.setConformidades(conformidadesSimples);

        // Calcular percentual de itens fora de conformidade
        double percentualFora = CalcularPontos.percentualItensForaConformidadeGlobal(safeForms, safeRespostas);
        relatorio.setPercentualItensForaConformidade(percentualFora);

        // relatorio.setMediaConformidadeGeral(mediaConformidadeVisita);

        relatorio.setViaturas(processarViaturas(safeViaturas));

        String baseNomeNormalizado = normalizarNome(base.getNome());

        // Encontrar dados para esta base
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

    public RelatorioConsolidadoResponse gerarRelatoriosPorPeriodoeIdBase(Long idBase, LocalDate dataInicio, LocalDate dataFim) {
        List<VisitaEntity> visitas = Optional.ofNullable(
                visitaService.getBaseByPeriodAndBaseId(idBase, dataInicio, dataFim)
        ).orElse(List.of());

        List<RelatorioTecnicoResponse> relatorios = visitas.stream()
                .filter(Objects::nonNull)
                .map(visita -> {
                    try {
                        return this.gerarRelatorio(visita.getId());
                    } catch (Exception e) {
                        System.err.println("Erro ao gerar relatório para visita: " + visita.getId());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return consolidarRelatorios(relatorios, dataInicio, dataFim);
    }

    public List<RelatorioTecnicoResponse> gerarRelatoriosPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        List<VisitaEntity> visitas = Optional.ofNullable(
                visitaService.getAllByPeriod(dataInicio, dataFim)
        ).orElse(List.of());

        return visitas.stream()
                .filter(Objects::nonNull)
                .map(visita -> {
                    try {
                        return this.gerarRelatorio(visita.getId());
                    } catch (Exception e) {
                        System.err.println("Erro ao gerar relatório para visita: " + visita.getId());
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
                    return metricas;
                })
                .collect(Collectors.toList());

        consolidado.setMetricasExternasBases(metricasExternas);

        return consolidado;
    }

    public List<BaseRankingDTO> getRankingBasesPeriodoAtual(LocalDate dataInicio, LocalDate dataFim) {
        List<BaseEntity> todasBases = baseService.getAllBases();
        List<BaseRankingDTO> ranking = new ArrayList<>();

        // OBTER DADOS EXTERNOS UMA ÚNICA VEZ
        List<VtrMediaDto> vtrMediaList = inspecaoServiceClient.getVtrMedia();
        HashMap<String, String> prontidaoMedia = inspecaoServiceClient.getMediaProntidao();
        HashMap<String, String> temposMedia = inspecaoServiceClient.getMediaTempos();

        // Criar mapas para acesso rápido por nome normalizado
        Map<String, Double> vtrMediaMap = new HashMap<>();
        Map<String, String> prontidaoMediaMap = new HashMap<>();
        Map<String, String> temposMediaMap = new HashMap<>();

        for (VtrMediaDto vtr : vtrMediaList) {

                vtrMediaMap.put(normalizarNome(vtr.getCidade()), vtr.getAtiva());

        }

        for (Map.Entry<String, String> entry : prontidaoMedia.entrySet()) {
            prontidaoMediaMap.put(normalizarNome(entry.getKey()), entry.getValue());
        }

        for (Map.Entry<String, String> entry : temposMedia.entrySet()) {
            temposMediaMap.put(normalizarNome(entry.getKey()), entry.getValue());
        }

        for (BaseEntity base : todasBases) {
            try {
                List<VisitaEntity> visitas = visitaService.getBaseByPeriodAndBaseId(
                        base.getId(),
                        dataInicio,
                        dataFim
                );

                if (visitas.isEmpty()) {
                    continue;
                }

                double somaMediasConformidade = 0.0;
                int totalVisitasComConformidade = 0;

                for (VisitaEntity visita : visitas) {
                    try {
                        List<FormResponse> formsVisita = Optional.ofNullable(formService.getAll()).orElse(List.of());
                        List<RespostaResponse> respostasVisita = Optional.ofNullable(formService.getRespostasByVisitaId(visita.getId())).orElse(List.of());

                        CalcularPontos.ResultadosHierarquicos resultados =
                                CalcularPontos.calcularConformidadeHierarquica(formsVisita, respostasVisita);

                        double mediaConformidadeVisita = resultados.geral.porcentagem;

                        if (mediaConformidadeVisita > 0) {
                            somaMediasConformidade += mediaConformidadeVisita;
                            totalVisitasComConformidade++;
                        }
                    } catch (Exception e) {
                        System.err.println("Erro ao processar visita " + visita.getId() + ": " + e.getMessage());
                        continue;
                    }
                }

                if (totalVisitasComConformidade > 0) {
                    double mediaConformidadeBase = somaMediasConformidade / totalVisitasComConformidade;

                    VisitaEntity ultimaVisita = visitas.stream()
                            .filter(Objects::nonNull)
                            .max(Comparator.comparing(VisitaEntity::getDataVisita))
                            .orElse(null);

                    // BUSCAR DADOS EXTERNOS PARA ESTA BASE
                    String baseNomeNormalizado = normalizarNome(base.getNome());

                    BaseRankingDTO baseRanking = new BaseRankingDTO(
                            base.getNome(),
                            base.getId(),
                            mediaConformidadeBase,
                            ultimaVisita != null ? ultimaVisita.getDataVisita() : null
                    );

                    // Adicionar métricas externas
                    baseRanking.setPorcentagemVtrAtiva(vtrMediaMap.get(baseNomeNormalizado));
                    baseRanking.setTempoMedioProntidao(prontidaoMediaMap.get(baseNomeNormalizado));
                    baseRanking.setTempoMedioAtendimento(temposMediaMap.get(baseNomeNormalizado));

                    ranking.add(baseRanking);
                }
            } catch (Exception e) {
                System.err.println("Erro ao processar base " + base.getId() + ": " + e.getMessage());
            }
        }

        // Ordenar por média de conformidade (maior primeiro)
        ranking.sort((b1, b2) -> Double.compare(b2.getMediaConformidade(), b1.getMediaConformidade()));

        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).setPosicaoRanking(i + 1);
        }

        return ranking;
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