package com.baseservice.service;

import com.baseservice.entity.BaseDTO;
import com.baseservice.entity.BaseEntity;

class BaseMapper {

    protected static BaseEntity toEntity(BaseDTO baseDTO) {
        return BaseEntity.builder()
                .nome(baseDTO.getNome())
                .endereco(baseDTO.getEndereco())
                .tipoBase(baseDTO.getTipoBase())
                .build();
    }
    protected static BaseDTO toDTO(BaseEntity baseEntity) {
        return BaseDTO.builder()
                .nome(baseEntity.getNome())
                .endereco(baseEntity.getEndereco())
                .tipoBase(baseEntity.getTipoBase())
                .build();
    }
}
