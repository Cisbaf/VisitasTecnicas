package com.inspecaoservice.entity.dto.campos;

import com.inspecaoservice.entity.CamposFormEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

/**
 * DTO for {@link CamposFormEntity}
 */
public record CamposFormRequest(
        @NotBlank(message = "O titulo do campoId é requerido")
        String titulo,
        @NotNull(message = "O tipo do campoId é requerido")
        String tipo,
        Long formId
) implements Serializable {
}