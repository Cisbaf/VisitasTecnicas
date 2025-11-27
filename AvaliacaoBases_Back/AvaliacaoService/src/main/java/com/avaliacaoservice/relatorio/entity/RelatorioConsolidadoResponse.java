package com.avaliacaoservice.relatorio.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RelatorioConsolidadoResponse {
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private int totalVisitas;
    private List<String> pontosFortes;
    private List<PontoCriticoDTO> pontosCriticosGerais;
    private Map<String, Double> mediasConformidade;
    private Map<Long, Double> conformidadesPorSummary;
    private double mediaGeralConformidade;
    private List<ViaturaDTO> viaturasCriticas;
    private List<BaseRankingDTO> rankingBases;
    private List<BaseMetricasExternasDTO> metricasExternasBases;
}
