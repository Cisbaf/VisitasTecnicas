package com.relatorioservice.service;

import com.relatorioservice.entity.dtos.*;
import com.relatorioservice.entity.fora.Visita.EquipeTecnica;
import com.relatorioservice.entity.fora.Visita.RelatoEntity;
import com.relatorioservice.entity.fora.Visita.VisitaEntity;
import com.relatorioservice.entity.fora.base.BaseEntity;
import com.relatorioservice.entity.fora.checklist.AvaliacaoEntity;
import com.relatorioservice.entity.fora.checklist.CheckDescription;
import com.relatorioservice.entity.fora.checklist.CheckListEntity;
import com.relatorioservice.entity.fora.viatura.ViaturaEntity;
import com.relatorioservice.service.client.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import static com.relatorioservice.service.CalcularPontos.calcularPontosCriticos;
import static com.relatorioservice.service.CalcularPontos.calcularPontosFortes;

@Service
@RequiredArgsConstructor
public class RelatorioTecnicoService {

    private final BaseServiceClient baseService;
    private final VisitaServiceClient visitaService;
    private final ChecklistServiceClient checklistService;
    private final ViaturaServiceClient viaturaService;
    private final AvaliacaoServiceClient avaliacaoService;

    public RelatorioTecnicoResponse gerarRelatorio(Long visitaId) {
        VisitaEntity visita = visitaService.getVisitaById(visitaId);
        BaseEntity base = baseService.getBaseById(visita.getIdBase());

        List<EquipeTecnica> equipe = visitaService.getAllMembrosByVisitaId(visitaId);
        List<RelatoEntity> relatos = visitaService.getRelatosByVisita(visitaId);
        List<ViaturaEntity> viaturas = viaturaService.getViaturasByBase(base.getId());

        List<CheckListEntity> checklists = checklistService.findByVisitaId(visitaId);
        List<AvaliacaoEntity> avaliacoes = avaliacaoService.getAvaliacoesByVisita(visitaId);

        return processarRelatorio(visita, base, equipe, relatos, viaturas, checklists, avaliacoes);
    }

    private RelatorioTecnicoResponse processarRelatorio(VisitaEntity visita,
                                                        BaseEntity base,
                                                        List<EquipeTecnica> equipe,
                                                        List<RelatoEntity> relatos,
                                                        List<ViaturaEntity> viaturas,
                                                        List<CheckListEntity> checklists,
                                                        List<AvaliacaoEntity> avaliacoes) {

        RelatorioTecnicoResponse relatorio = new RelatorioTecnicoResponse();

        relatorio.setVisitaId(visita.getId());
        relatorio.setDataVisita(visita.getDataVisita());
        relatorio.setBaseNome(base.getNome());
        relatorio.setMunicipio(base.getEndereco());

        relatorio.setEquipe(equipe.stream()
                .map(m -> new MembroDTO(m.getNome(), m.getCargo()))
                .collect(Collectors.toList()));

        relatorio.setPontosFortes(calcularPontosFortes(checklists, viaturas, relatos));
        relatorio.setPontosCriticos(calcularPontosCriticos(checklists, relatos, viaturas));
        relatorio.setConformidades(calcularConformidades(checklists, avaliacoes));

        relatorio.setViaturas(processarViaturas(viaturas));
        relatorio.setRelatos(processarRelatos(relatos));

        return relatorio;
    }

    private Map<String, Double> calcularConformidades(List<CheckListEntity> checklists,
                                                      List<AvaliacaoEntity> avaliacoes) {

        Map<String, Double> conformidades = new HashMap<>();

        if (checklists != null) {
            checklists.forEach(cl -> {
                double percentual = cl.getDescricao().stream()
                        .mapToDouble(d -> {
                            if (d.getTipoConformidade() == null) return 0.0;
                            return switch (d.getTipoConformidade()) {
                                case CONFORME -> 1.0;
                                case PARCIAL -> 0.5;
                                case NAO_CONFORME -> 0.0;
                            };
                        })
                        .average()
                        .orElse(0.0) * 100;

                conformidades.put(cl.getCategoria(), percentual);
            });
        }

        avaliacoes.stream()
                .filter(a -> a.getIdViatura() != null)
                .collect(Collectors.groupingBy(
                        a -> viaturaService.getViaturaById(a.getIdViatura()).getPlaca(),
                        Collectors.averagingDouble((a) -> {
                            var check = checklistService.getCheckListById(a.getIdCheckList());
                            return check.getDescricao().stream()
                                    .mapToDouble(CheckDescription::getConformidadePercent)
                                    .average()
                                    .orElse(0.0);
                        })
                ))
                .forEach((placa, percentual) ->
                        conformidades.put("Viatura " + placa, percentual));

        return conformidades;
    }

    private List<ViaturaDTO> processarViaturas(List<ViaturaEntity> viaturas) {
        return viaturas.stream().map(v -> {
            ViaturaDTO dto = new ViaturaDTO();
            dto.setPlaca(v.getPlaca());
            dto.setModelo(v.getModelo());
            dto.setStatus(v.getStatusOperacional());
            dto.setItensCriticos(v.getItens().stream()
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
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed()) // ordena por frequência
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

        // CORREÇÃO: Agrupar viaturas por placa para remover duplicatas
        Map<String, ViaturaDTO> viaturasUnicas = relatorios.stream()
                .flatMap(r -> r.getViaturas().stream())
                .filter(v -> !v.getItensCriticos().isEmpty())
                .collect(Collectors.toMap(
                        ViaturaDTO::getPlaca,  // Usar a placa como chave
                        v -> v,
                        (v1, v2) -> v1         // Em caso de duplicata, manter a primeira
                ));

        consolidado.setViaturasCriticas(new ArrayList<>(viaturasUnicas.values()));

        consolidado.setRankingBases(getRankingBasesPeriodoAtual(dataInicio, dataFim));
        return consolidado;
    }

    public List<BaseRankingDTO> getRankingBasesPeriodoAtual(LocalDate dataInicio, LocalDate dataFim) {
        // Busca todas as bases
        List<BaseEntity> todasBases = baseService.getAllBases();
        List<BaseRankingDTO> ranking = new ArrayList<>();

        for (BaseEntity base : todasBases) {
            try {
                // Busca visitas da base no período
                List<VisitaEntity> visitas = visitaService.getAllByPeriod(
                        base.getId(),
                        dataInicio,
                        dataFim
                );

                if (visitas.isEmpty()) continue;

                // Encontra a visita mais recente
                VisitaEntity ultimaVisita = visitas.stream()
                        .max(Comparator.comparing(VisitaEntity::getDataVisita))
                        .orElse(null);

                // Gera relatório da última visita
                RelatorioTecnicoResponse relatorio = this.gerarRelatorio(ultimaVisita.getId());

                // Calcula média geral de conformidades
                double mediaGeral = relatorio.getConformidades().values().stream()
                        .mapToDouble(Double::doubleValue)
                        .average()
                        .orElse(0.0);

                ranking.add(new BaseRankingDTO(
                        base.getNome(),
                        base.getId(),
                        mediaGeral,
                        ultimaVisita.getDataVisita()
                ));
            } catch (Exception e) {
                // Log de erro para a base específica
                System.err.println("Erro ao processar base " + base.getId() + ": " + e.getMessage());
            }
        }

        // Ordena as bases pela média de conformidade
        Collections.sort(ranking);

        // Atribui posições no ranking
        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).setPosicaoRanking(i + 1);
        }

        return ranking;
    }
}