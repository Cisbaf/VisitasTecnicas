package com.avaliacaoservice.inspecao.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VTR{
    private Long ativa;
    private String placa;
    private String CNES;
    private String viatura;
}


