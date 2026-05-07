package com.avaliacaoservice.inspecao.entity.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class CidadeProntidaoResponse {
    private String cidade;
    private LocalDate dataEnvio;
    private LocalDate dataVigencia;
    private String saidaEquipe;


}
