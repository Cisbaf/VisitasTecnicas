package com.viaturaservice.service;

import com.viaturaservice.entity.ViaturaDTO;
import com.viaturaservice.entity.ViaturaEntity;

class ViaturaMapper {

    protected static ViaturaEntity toEntity(ViaturaDTO viaturaDTO) {
        return ViaturaEntity.builder()
                .placa(viaturaDTO.getPlaca())
                .modelo(viaturaDTO.getModelo())
                .ano(viaturaDTO.getAno())
                .tipoViatura(viaturaDTO.getTipoViatura())
                .statusOperacional(viaturaDTO.getStatusOperacional())
                .idBase(viaturaDTO.getIdBase())
                .build();
    }
    protected static ViaturaDTO toDTO(ViaturaEntity viaturaEntity) {
        return ViaturaDTO.builder()
                .placa(viaturaEntity.getPlaca())
                .modelo(viaturaEntity.getModelo())
                .ano(viaturaEntity.getAno())
                .tipoViatura(viaturaEntity.getTipoViatura())
                .statusOperacional(viaturaEntity.getStatusOperacional())
                .idBase(viaturaEntity.getIdBase())
                .build();
    }
}
