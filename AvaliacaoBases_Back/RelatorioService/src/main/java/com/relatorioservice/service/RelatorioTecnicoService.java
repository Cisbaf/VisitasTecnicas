package com.relatorioservice.service;

import com.relatorioservice.entity.dtos.*;
import com.relatorioservice.entity.fora.Visita.EquipeTecnica;
import com.relatorioservice.entity.fora.Visita.RelatoEntity;
import com.relatorioservice.entity.fora.Visita.VisitaEntity;
import com.relatorioservice.entity.fora.base.BaseEntity;
import com.relatorioservice.entity.fora.forms.dto.FormResponse;
import com.relatorioservice.entity.fora.forms.dto.RespostaResponse;
import com.relatorioservice.entity.fora.viatura.ViaturaEntity;
import com.relatorioservice.service.client.BaseServiceClient;
import com.relatorioservice.service.client.FormServiceClient;
import com.relatorioservice.service.client.ViaturaServiceClient;
import com.relatorioservice.service.client.VisitaServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelatorioTecnicoService {

    private final BaseServiceClient baseService;
    private final VisitaServiceClient visitaService;
    private final FormServiceClient formService;
    private final ViaturaServiceClient viaturaService;

    public RelatorioTecnicoResponse gerarRelatorio(Long visitaId) {
        VisitaEntity visita = visitaService.getVisitaById(visitaId);
        BaseEntity base = baseService.getBaseById(visita.getIdBase());
        List<EquipeTecnica> equipe = visitaService.getAllMembrosByVisitaId(visitaId);
        List<RelatoEntity> relatos = visitaService.getRelatosByVisita(visitaId);
        List<ViaturaEntity> viaturas = viaturaService.getViaturasByBase(base.getId());

        List<FormResponse> forms = Optional.ofNullable(formService.getAll()).orElse(List.of());
        List<RespostaResponse> respostas = Optional.ofNullable(formService.getRespostasByVisitaId(visitaId)).orElse(List.of());

        return processarRelatorio(visita, base, equipe, relatos, viaturas, forms, respostas);
    }

    private RelatorioTecnicoResponse processarRelatorio(VisitaEntity visita,
                                                        BaseEntity base,
                                                        List<EquipeTecnica> equipe,
                                                        List<RelatoEntity> relatos,
                                                        List<ViaturaEntity> viaturas,
                                                        List<FormResponse> forms,
                                                        List<RespostaResponse> respostas) {

        RelatorioTecnicoResponse relatorio = new RelatorioTecnicoResponse();

        relatorio.setVisitaId(visita.getId());
        relatorio.setDataVisita(visita.getDataVisita());
        relatorio.setBaseNome(base.getNome());
        relatorio.setMunicipio(base.getEndereco());

        relatorio.setEquipe(equipe.stream()
                .map(m -> new MembroDTO(m.getNome(), m.getCargo()))
                .collect(Collectors.toList()));

        // Usa a nova classe CalcularPontos.
        relatorio.setPontosFortes(CalcularPontos.calcularPontosFortes(forms, respostas, viaturas, relatos));
        relatorio.setPontosCriticos(CalcularPontos.calcularPontosCriticos(forms, respostas, relatos, viaturas));

        Map<String, CategoryConformanceDTO> confDetalhada = CalcularPontos.calcularConformidadesDetalhadas(forms, respostas);



        relatorio.setConformidadeDetalhada(confDetalhada);

        Map<String, Double> conformidadesSimples = confDetalhada.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().getMediaPercentTrue()));
        relatorio.setConformidades(conformidadesSimples);

        double percentualFora = CalcularPontos.percentualItensForaConformidadeGlobal(forms, respostas);
        relatorio.setPercentualItensForaConformidade(percentualFora);

        relatorio.setViaturas(processarViaturas(viaturas));
        relatorio.setRelatos(processarRelatos(relatos));

        return relatorio;
    }

    private List<ViaturaDTO> processarViaturas(List<ViaturaEntity> viaturas) {
        return viaturas.stream().map(v -> {
            ViaturaDTO dto = new ViaturaDTO();
            dto.setPlaca(v.getPlaca());
            dto.setModelo(v.getModelo());
            dto.setStatus(v.getStatusOperacional());
            dto.setItensCriticos(Optional.ofNullable(v.getItens()).orElse(List.of()).stream()
                    .filter(i -> i.getConformidade() < 80)
                    .map(i -> new ItemViaturaDTO(i.getNome(), i.getConformidade()))
                    .collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
    }

    private List<RelatoDTO> processarRelatos(List<RelatoEntity> relatos) {
        return Optional.ofNullable(relatos)
                .orElseGet(Collections::emptyList)
                .stream()
                .filter(r -> !r.getResolvido() ||
                        r.getData().after(Date.from(Instant.now().minus(7, ChronoUnit.DAYS))))
                .map(r -> new RelatoDTO(r.getTema(), r.getMensagem(), r.getResolvido()))
                .collect(Collectors.toList());
    }

    public RelatorioConsolidadoResponse gerarRelatoriosPorPeriodo(Long idBase, LocalDate dataInicio, LocalDate dataFim) {
        List<VisitaEntity> visitas = visitaService.getAllByPeriod(idBase, dataInicio, dataFim);

        List<RelatorioTecnicoResponse> relatorios = visitas.stream()
                .map(visita -> this.gerarRelatorio(visita.getId()))
                .collect(Collectors.toList());

        return consolidarRelatorios(relatorios, dataInicio, dataFim);
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
                .filter(v -> !v.getItensCriticos().isEmpty())
                .collect(Collectors.toMap(
                        ViaturaDTO::getPlaca,
                        v -> v,
                        (v1, v2) -> v1
                ));

        consolidado.setViaturasCriticas(new ArrayList<>(viaturasUnicas.values()));

        consolidado.setRankingBases(getRankingBasesPeriodoAtual(dataInicio, dataFim));
        return consolidado;
    }

    public List<BaseRankingDTO> getRankingBasesPeriodoAtual(LocalDate dataInicio, LocalDate dataFim) {
        List<BaseEntity> todasBases = baseService.getAllBases();
        List<BaseRankingDTO> ranking = new ArrayList<>();

        for (BaseEntity base : todasBases) {
            try {
                List<VisitaEntity> visitas = visitaService.getAllByPeriod(
                        base.getId(),
                        dataInicio,
                        dataFim
                );

                if (visitas.isEmpty()) {
                    continue;
                }

                // Calcular a média de conformidade de TODAS as visitas do período
                double mediaConformidade = 0.0;
                int totalVisitasComConformidade = 0;

                for (VisitaEntity visita : visitas) {
                    try {
                        RelatorioTecnicoResponse relatorio = this.gerarRelatorio(visita.getId());

                        if (relatorio.getConformidades() != null && !relatorio.getConformidades().isEmpty()) {
                            double mediaVisita = relatorio.getConformidades().values().stream()
                                    .mapToDouble(Double::doubleValue)
                                    .average()
                                    .orElse(0.0);

                            mediaConformidade += mediaVisita;
                            totalVisitasComConformidade++;
                        }
                    } catch (Exception e) {
                        System.err.println("Erro ao processar visita " + visita.getId() + ": " + e.getMessage());
                    }
                }

                if (totalVisitasComConformidade > 0) {
                    mediaConformidade /= totalVisitasComConformidade;
                }

                VisitaEntity ultimaVisita = visitas.stream()
                        .max(Comparator.comparing(VisitaEntity::getDataVisita))
                        .orElse(null);

                ranking.add(new BaseRankingDTO(
                        base.getNome(),
                        base.getId(),
                        mediaConformidade,
                        ultimaVisita != null ? ultimaVisita.getDataVisita() : null
                ));
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
}