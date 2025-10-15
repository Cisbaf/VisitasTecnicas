package com.relatorioservice.entity.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VtrMediaDto{
    private String cidade;
    private double ativa;

}
