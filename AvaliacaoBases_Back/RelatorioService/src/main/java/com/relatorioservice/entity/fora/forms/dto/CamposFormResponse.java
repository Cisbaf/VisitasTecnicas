package com.relatorioservice.entity.fora.forms.dto;

import com.relatorioservice.entity.fora.forms.enums.Tipo;
import lombok.Data;
import lombok.ToString;

import java.io.Serializable;

public record CamposFormResponse(
        Long id,
        String titulo,
        Tipo tipo,
        Long formId
) implements Serializable {
}