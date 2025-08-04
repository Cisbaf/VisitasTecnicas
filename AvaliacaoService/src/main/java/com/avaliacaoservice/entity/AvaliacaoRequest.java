package com.avaliacaoservice.entity;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.io.Serializable;

/**
 * DTO for {@link AvaliacaoEntity}
 */
public record AvaliacaoRequest(
        @NotNull(message = "Visita é requerida")
        @Positive(message = "Id de visita tem que ser positivo")
        Long idVisita,
        @NotNull(message = "CheckList é requerida para a avaliação")
        @Positive(message = "Id de CheckList tem que ser positivo")
        Long idCheckList,
        Long idViatura
) implements Serializable {
}