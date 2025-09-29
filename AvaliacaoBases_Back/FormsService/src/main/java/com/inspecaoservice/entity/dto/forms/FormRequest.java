package com.inspecaoservice.entity.dto.forms;

import com.inspecaoservice.entity.FormEntity;
import com.inspecaoservice.entity.dto.campos.CamposFormRequest;
import jakarta.validation.constraints.NotBlank;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link FormEntity}
 */
public record FormRequest(
        @NotBlank
        String categoria,
        List<CamposFormRequest> campos,
        String tipoForm
) implements Serializable {
}