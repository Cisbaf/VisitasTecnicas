package com.relatorioservice.entity.fora.forms.dto;

import java.io.Serializable;
import java.util.List;

public record FormResponse(
        Long id,
        String categoria,
        List<CamposFormResponse> campos
) implements Serializable {
}