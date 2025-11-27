package com.avaliacaoservice.relatorio.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BaseMetricasExternasDTO {
    private String baseNome;
    private Long idBase;
    private Double porcentagemVtrAtiva;
    private String tempoMedioProntidao;
    private String tempoMedioAtendimento;
    private Double mediaConformidade;

}
