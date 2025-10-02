package com.relatorioservice.entity.fora.forms.dto;

import com.relatorioservice.entity.fora.forms.enums.CheckBox;
import com.relatorioservice.entity.fora.forms.enums.Select;
import lombok.Builder;

import java.io.Serializable;

@Builder
public record RespostaResponse(
        Long id,
        String texto,
        CheckBox checkbox,
        Select select,
        Long visitaId,
        Long campoId
) implements Serializable {
}