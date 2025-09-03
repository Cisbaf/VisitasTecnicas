package com.formservice.entity.dto.forms;

import com.formservice.entity.CamposFormEntity;
import com.formservice.entity.FormEntity;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link FormEntity}
 */
public record FormResponse(
        Long id,
        String categoria,
        List<CamposFormEntity> campos
) implements Serializable {
}