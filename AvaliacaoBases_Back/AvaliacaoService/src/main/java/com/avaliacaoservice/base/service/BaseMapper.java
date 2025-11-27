package com.avaliacaoservice.base.service;

import com.avaliacaoservice.base.entity.BaseEntity;
import com.avaliacaoservice.base.entity.BaseRequest;
import com.avaliacaoservice.base.entity.BaseResponse;
import org.springframework.stereotype.Service;

@Service
class BaseMapper {
    protected static BaseEntity toEntity(BaseRequest baseRequest) {
        return BaseEntity.builder()
                .nome(baseRequest.nome().toUpperCase())
                .endereco(baseRequest.endereco())
                .bairro(baseRequest.bairro())
                .municipio(baseRequest.municipio())
                .telefone(baseRequest.telefone())
                .email(baseRequest.email())
                .tipoBase(baseRequest.tipoBase())
                .build();
    }

    protected static BaseResponse toDTO(BaseEntity baseEntity) {
        return BaseResponse.builder()
                .id(baseEntity.getId())
                .nome(baseEntity.getNome().toUpperCase())
                .endereco(baseEntity.getEndereco())
                .bairro(baseEntity.getBairro())
                .municipio(baseEntity.getMunicipio())
                .telefone(baseEntity.getTelefone())
                .email(baseEntity.getEmail())
                .tipoBase(baseEntity.getTipoBase())
                .build();
    }
}


