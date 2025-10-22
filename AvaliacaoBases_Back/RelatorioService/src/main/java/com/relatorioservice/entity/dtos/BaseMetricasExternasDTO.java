package com.relatorioservice.entity.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseMetricasExternasDTO {
    private String baseNome;
    private Long idBase;
    private Double porcentagemVtrAtiva;
    private String tempoMedioProntidao;
    private String tempoMedioAtendimento;
    private Double mediaConformidade;
}
