package com.baseservice.service;

import com.baseservice.entity.BaseRequest;
import com.baseservice.entity.BaseEntity;
import com.baseservice.entity.BaseResponse;

class BaseMapper {

    protected static BaseEntity toEntity(BaseRequest baseRequest) {
        return BaseEntity.builder()
                .nome(baseRequest.getNome())
                .endereco(baseRequest.getEndereco())
                .tipoBase(baseRequest.getTipoBase())
                .build();
    }
    protected static BaseResponse toDTO(BaseEntity baseEntity) {
        return BaseResponse.builder()
                .id(baseEntity.getId())
                .nome(baseEntity.getNome())
                .endereco(baseEntity.getEndereco())
                .tipoBase(baseEntity.getTipoBase())
                .build();
    }
}
