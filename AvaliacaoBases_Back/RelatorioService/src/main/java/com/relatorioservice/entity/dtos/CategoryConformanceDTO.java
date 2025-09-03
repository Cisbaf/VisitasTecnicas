package com.relatorioservice.entity.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryConformanceDTO implements Serializable {
    private String categoria;
    private double mediaPercentTrue;    // média % TRUE entre os campos CHECKBOX da categoria (0-100)
    private double mediaPercentFalse;   // média % FALSE entre os campos CHECKBOX da categoria (0-100)
    private double mediaPercentNotGiven;// média % NOT_GIVEN entre os campos CHECKBOX da categoria (0-100)
    private double percentualCamposForaConformidade; // % de campos (da categoria) com percentTrue < threshold

}
