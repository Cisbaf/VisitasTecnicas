package com.inspecaoservice.entity.dto.campos;

import com.inspecaoservice.entity.CamposFormEntity;
import com.inspecaoservice.entity.emuns.Tipo;
import lombok.Builder;

import java.io.Serializable;

/**
 * DTO for {@link CamposFormEntity}
 */
@Builder
public record CamposFormResponse(
        Long id,
        String titulo,
        Tipo tipo,
        Long formId
) implements Serializable {}