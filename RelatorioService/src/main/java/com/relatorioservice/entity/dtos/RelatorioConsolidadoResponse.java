package com.relatorioservice.entity.dtos;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class RelatorioConsolidadoResponse {
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private int totalVisitas;
    private List<String> pontosFortes;
    private List<String> pontosCriticosRecorrentes;
    private Map<String, Double> mediasConformidade;  // Categoria → Média percentual
    private List<ViaturaDTO> viaturasCriticas;
}
