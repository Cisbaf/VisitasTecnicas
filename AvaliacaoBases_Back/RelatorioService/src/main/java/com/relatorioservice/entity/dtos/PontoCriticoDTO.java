package com.relatorioservice.entity.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;

@Data
@AllArgsConstructor
@Builder
@ToString
public class PontoCriticoDTO {
    private String descricao;
    private Long ocorrencias;
}