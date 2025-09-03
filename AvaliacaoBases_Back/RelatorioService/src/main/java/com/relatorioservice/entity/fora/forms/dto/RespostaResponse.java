package com.relatorioservice.entity.fora.forms.dto;

import com.relatorioservice.entity.fora.forms.enums.CheckBox;
import lombok.Builder;

import java.io.Serializable;

@Builder
public record RespostaResponse(
        Long id,
        String texto,
        CheckBox checkbox,
        Long visitaId,
        Long campo
) implements Serializable {
}