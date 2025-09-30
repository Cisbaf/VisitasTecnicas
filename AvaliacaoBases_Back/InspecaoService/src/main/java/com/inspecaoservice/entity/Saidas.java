package com.inspecaoservice.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public record Saidas(
        String mesAno,
        Double saidaEquipe
) {
}
