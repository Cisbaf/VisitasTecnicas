package com.inspecaoservice.entity.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class VtrRequest {

    private String cidade;
    private Long ativa;
    private String placa;
    private String CNES;
    private String viatura;
}
