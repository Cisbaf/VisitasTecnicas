package com.relatorioservice.entity.dtos;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class RelatorioTecnicoResponse {
    private Long visitaId;
    private LocalDate dataVisita;
    private String baseNome;
    private String municipio;

    private List<MembroDTO> equipe;

    private List<String> pontosFortes;
    private List<String> pontosCriticos;

    private Map<String, Double> conformidades;

    private Map<String, CategoryConformanceDTO> conformidadeDetalhada;

    private Double percentualItensForaConformidade;

    private List<ViaturaDTO> viaturas;
    private List<RelatoDTO> relatos;

    private Double porcentagemVtrAtiva;
    private String tempoMedioProntidao;
    private String tempoMedioAtendimento;
}