package com.relatorioservice.entity.fora.forms.dto;

import java.io.Serializable;
import java.util.List;

public record FormResponse(
        Long id,
        String categoria,
        Long summaryId,
        List<CamposFormResponse> campos
) implements Serializable {
}