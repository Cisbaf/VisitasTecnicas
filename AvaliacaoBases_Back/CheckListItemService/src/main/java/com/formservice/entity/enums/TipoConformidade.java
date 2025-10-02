package com.formservice.entity.enums;

import lombok.Getter;

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
