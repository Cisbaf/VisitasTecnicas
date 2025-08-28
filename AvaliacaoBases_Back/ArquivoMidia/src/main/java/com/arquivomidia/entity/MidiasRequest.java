package com.arquivomidia.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import org.hibernate.validator.constraints.URL;

import java.io.Serializable;

/**
 * DTO for {@link MidiasEntity}
 */
@Builder
public record MidiasRequest(
        @NotBlank(message = "O tipo de arquivo é requerido")
        String tipoArquivo,
        @NotBlank(message = "A url do arquivo é requerido")
        @URL(message = "URL mal formatada")
        String url,
        @Positive
        Long idVisita,
        @Positive
        Long idInconformidade
) implements Serializable {
}