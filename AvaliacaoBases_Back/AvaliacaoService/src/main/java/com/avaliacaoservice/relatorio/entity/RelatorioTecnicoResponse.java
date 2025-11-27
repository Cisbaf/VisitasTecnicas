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
public class RelatorioTecnicoResponse {
    private Long visitaId;
    private LocalDate dataVisita;
    private String baseNome;
    private String municipio;
    private List<MembroDTO> equipe;
    private List<String> pontosFortes;
    private List<String> pontosCriticos;
    private Map<String, Double> conformidades;
    private Map<Long, Double> conformidadesPorSummary;
    private Map<String, CategoryConformanceDTO> conformidadeDetalhada;
    private Double percentualItensForaConformidade;
    private List<ViaturaDTO> viaturas;
    private List<RelatoDTO> relatos;
    private Double porcentagemVtrAtiva;
    private String tempoMedioProntidao;
    private String tempoMedioAtendimento;
    private double mediaGeralConformidade;

}

