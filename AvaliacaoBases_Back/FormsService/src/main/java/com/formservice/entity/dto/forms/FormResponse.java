package com.formservice.entity.dto.forms;

import com.formservice.entity.CamposFormEntity;
import com.formservice.entity.FormEntity;
import com.formservice.entity.emuns.TipoForm;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link FormEntity}
 */
public record FormResponse(
        Long id,
        String categoria,
        Long summaryId,
        List<CamposFormEntity> campos,
        TipoForm tipoForm
) implements Serializable {
}