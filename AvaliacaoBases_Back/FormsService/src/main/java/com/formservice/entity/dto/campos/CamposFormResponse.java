package com.formservice.entity.dto.campos;

import com.formservice.entity.CamposFormEntity;
import com.formservice.entity.emuns.Tipo;
import lombok.Builder;
import lombok.Data;

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