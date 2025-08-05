package com.relatorioservice.entity.dtos;

import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
public class RelatorioTecnicoDTO {
    private Long visitaId;
    private Date dataVisita;
    private String baseNome;
    private String municipio;

    private List<String> pontosFortes;
    private List<String> pontosCriticos;
    private Map<String, Double> conformidades;
    private List<String> viaturas;
    private List<String> relatos;
    private List<String> equipe;
}