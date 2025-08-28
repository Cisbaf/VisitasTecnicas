package com.avaliacaoservice.service;

import com.avaliacaoservice.entity.AvaliacaoEntity;
import com.avaliacaoservice.entity.AvaliacaoRequest;


public class AvaliacaoMapper {

    static AvaliacaoEntity toEntity(AvaliacaoRequest request) {
        return AvaliacaoEntity.builder()
                .idVisita(request.idVisita())
                .idCheckList(request.idCheckList())
                .idViatura(request.idViatura())
                .build();
    }
}
