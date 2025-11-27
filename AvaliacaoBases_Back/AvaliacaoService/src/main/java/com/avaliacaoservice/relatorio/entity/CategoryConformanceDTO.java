package com.avaliacaoservice.relatorio.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryConformanceDTO {
    private String categoria;
    private double mediaPercentTrue;
    private double mediaPercentFalse;
    private double mediaPercentNotGiven;
    private double percentualCamposForaConformidade;

}


