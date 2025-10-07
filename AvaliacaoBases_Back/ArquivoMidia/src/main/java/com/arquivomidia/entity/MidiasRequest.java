package com.arquivomidia.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Builder;

import java.io.Serializable;

/**
 * DTO for {@link MidiasEntity}
 */
@Builder
public record MidiasRequest(
        @NotBlank(message = "O tipo de arquivo é requerido")
        String tipoArquivo,
        @Positive
        Long idVisita,
        String flag
) implements Serializable {
}