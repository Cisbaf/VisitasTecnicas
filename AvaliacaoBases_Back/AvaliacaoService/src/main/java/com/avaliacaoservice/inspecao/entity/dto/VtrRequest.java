package com.avaliacaoservice.inspecao.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VtrRequest {
    private String cidade;
    private Long ativa;
    private String placa;
    private String CNES;
    private String viatura;

}


