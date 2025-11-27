package com.avaliacaoservice.relatorio.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PontoCriticoDTO {
    private String descricao;
    private Long ocorrencias;
}


