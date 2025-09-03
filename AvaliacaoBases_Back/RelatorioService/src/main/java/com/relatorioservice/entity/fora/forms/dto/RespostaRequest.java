package com.relatorioservice.entity.fora.forms.dto;

import com.relatorioservice.entity.fora.forms.enums.CheckBox;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.io.Serializable;

public record RespostaRequest(
        String texto,
        CheckBox checkbox,
        @NotNull
        @Positive
        Long visitaId
) implements Serializable {
}