package com.avaliacaoservice.form.entity.dto.forms;

import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.emuns.TipoForm;

import java.util.List;

public record FormResponse(
        Long id,
        String categoria,
        Long summaryId,
        List<CamposFormEntity> campos,
        TipoForm tipoForm,
        Long visitaId
) {
}

