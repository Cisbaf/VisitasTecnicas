package com.avaliacaoservice.arquivos.entity;


import lombok.Getter;

@Getter
public enum TipoMidia {
    FOTO("foto"),
    VIDEO("video");

    private final String descricao;

    TipoMidia(String descricao) {
        this.descricao = descricao;
    }

}

