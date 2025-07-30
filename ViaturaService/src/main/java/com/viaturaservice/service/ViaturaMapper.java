package com.viaturaservice.service;

import com.viaturaservice.entity.ViaturaDTO;
import com.viaturaservice.entity.ViaturaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
class ViaturaMapper {
    private final IdBaseExists exists;

    protected ViaturaEntity toEntity(ViaturaDTO viaturaDTO) {
        if (exists.existsById(viaturaDTO.getIdBase())) {
            return ViaturaEntity.builder()
                    .placa(viaturaDTO.getPlaca().toUpperCase())
                    .modelo(viaturaDTO.getModelo())
                    .ano(viaturaDTO.getAno())
                    .tipoViatura(viaturaDTO.getTipoViatura())
                    .statusOperacional(viaturaDTO.getStatusOperacional())
                    .idBase(viaturaDTO.getIdBase())
                    .itens(viaturaDTO.getItens())
                    .build();
        }
        throw new IllegalArgumentException("Base ID does not exist: " + viaturaDTO.getIdBase());
    }

    protected static ViaturaDTO toDTO(ViaturaEntity viaturaEntity) {
        return ViaturaDTO.builder()
                .placa(viaturaEntity.getPlaca())
                .modelo(viaturaEntity.getModelo())
                .ano(viaturaEntity.getAno())
                .tipoViatura(viaturaEntity.getTipoViatura())
                .statusOperacional(viaturaEntity.getStatusOperacional())
                .idBase(viaturaEntity.getIdBase())
                .itens(viaturaEntity.getItens())
                .build();
    }
}
