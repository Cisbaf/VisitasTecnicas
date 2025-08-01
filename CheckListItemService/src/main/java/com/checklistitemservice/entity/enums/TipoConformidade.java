package com.checklistitemservice.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
public enum TipoConformidade {
    CONFORME(1),
    PARCIAL(2),
    NAO_CONFORME(0);

    private final int descricao;

    TipoConformidade(int descricao) {
        this.descricao = descricao;
    }

}
