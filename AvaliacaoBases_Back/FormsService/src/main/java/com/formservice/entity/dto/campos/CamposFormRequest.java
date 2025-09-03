package com.formservice.entity.dto.campos;

import com.formservice.entity.CamposFormEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

/**
 * DTO for {@link CamposFormEntity}
 */
public record CamposFormRequest(
        @NotBlank(message = "O titulo do campo é requerido")
        String titulo,
        @NotNull(message = "O tipo do campo é requerido")
        String tipo,
        Long formId
) implements Serializable {
}