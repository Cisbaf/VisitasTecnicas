package com.inspecaoservice.entity.dto.forms;

import com.inspecaoservice.entity.CamposFormEntity;
import com.inspecaoservice.entity.FormEntity;
import com.inspecaoservice.entity.emuns.TipoForm;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link FormEntity}
 */
public record FormResponse(
        Long id,
        String categoria,
        List<CamposFormEntity> campos,
        TipoForm tipoForm
) implements Serializable {
}