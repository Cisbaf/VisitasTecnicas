package com.relatorioservice.entity.fora.checklist.enums;

import lombok.Getter;

@Getter
public enum TipoConformidade {
    CONFORME(1),
    PARCIAL(2),
    NAO_CONFORME(0);

    private final int valor;

    TipoConformidade(int valor) {
        this.valor = valor;
    }

}
