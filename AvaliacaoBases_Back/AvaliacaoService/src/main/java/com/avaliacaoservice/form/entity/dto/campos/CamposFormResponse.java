package com.avaliacaoservice.form.entity.dto.campos;

import com.avaliacaoservice.form.entity.emuns.Tipo;
import lombok.Builder;

import java.io.Serializable;

@Builder
public record CamposFormResponse(
        Long id,
        String titulo,
        Tipo tipo,
        Long formId
) implements Serializable {
}