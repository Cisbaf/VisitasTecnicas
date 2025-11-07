package com.avaliacaoservice.inspecao.entity;

import jakarta.persistence.Embeddable;
import lombok.Builder;

@Embeddable
@Builder
public record VTR(
        Long ativa,
        String placa,
        String CNES,
        String viatura

) {

}


