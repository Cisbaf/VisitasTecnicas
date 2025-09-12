package com.formservice.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Criticidade {
    ALTA(3),
    MEDIA(2),
    BAIXA(1),
    NENHUMA(0);

    private final int criticidade;



}
