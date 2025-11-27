package com.avaliacaoservice.inspecao.entity;

import jakarta.persistence.Embeddable;
import lombok.Builder;

import java.time.LocalDate;

@Embeddable
@Builder
public record Saidas(
        LocalDate mesAno,
        String saidaEquipe
) {

}