package com.avaliacaoservice.form.entity.dto.forms;

import com.avaliacaoservice.form.entity.dto.campos.CamposFormRequest;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record FormRequest(
        @NotBlank String categoria,
        Long summaryId,
        List<CamposFormRequest> campos,
        String tipoForm,
        Long visitaId
) {
}
