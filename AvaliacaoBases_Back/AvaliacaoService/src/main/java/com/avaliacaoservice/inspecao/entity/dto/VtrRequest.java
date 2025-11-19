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
    @Builder.Default
    private Long ativa = 0L;
    private String placa;
    private String CNES;
    private String viatura;

}


