package com.baseservice.service;

import com.baseservice.entity.BaseRequest;
import com.baseservice.entity.BaseEntity;
import com.baseservice.entity.BaseResponse;

class BaseMapper {

    protected static BaseEntity toEntity(BaseRequest baseRequest) {
        return BaseEntity.builder()
                .nome(baseRequest.getNome())
                .endereco(baseRequest.getEndereco())
                .bairro(baseRequest.getBairro())
                .municipio(baseRequest.getMunicipio())
                .telefone(baseRequest.getTelefone())
                .email(baseRequest.getEmail())
                .tipoBase(baseRequest.getTipoBase())
                .build();
    }
    protected static BaseResponse toDTO(BaseEntity baseEntity) {
        return BaseResponse.builder()
                .id(baseEntity.getId())
                .nome(baseEntity.getNome())
                .endereco(baseEntity.getEndereco())
                .bairro(baseEntity.getBairro())
                .municipio(baseEntity.getMunicipio())
                .telefone(baseEntity.getTelefone())
                .email(baseEntity.getEmail())
                .tipoBase(baseEntity.getTipoBase())
                .build();
    }
}
