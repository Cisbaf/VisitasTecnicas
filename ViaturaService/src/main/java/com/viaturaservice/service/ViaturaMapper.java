package com.viaturaservice.service;

import com.viaturaservice.entity.ViaturaEntity;
import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class ViaturaMapper {
    private final IdBaseExists exists;

    protected ViaturaEntity toEntity(ViaturaRequest viaturaRequest) {
        if (exists.existsById(viaturaRequest.getIdBase())) {
            return ViaturaEntity.builder()
                    .placa(viaturaRequest.getPlaca().toUpperCase())
                    .modelo(viaturaRequest.getModelo())
                    .ano(viaturaRequest.getAno())
                    .tipoViatura(viaturaRequest.getTipoViatura())
                    .statusOperacional(viaturaRequest.getStatusOperacional())
                    .idBase(viaturaRequest.getIdBase())
                    .itens(viaturaRequest.getItens())
                    .build();
        }
        throw new IllegalArgumentException("Base ID does not exist: " + viaturaRequest.getIdBase());
    }

    protected static ViaturaResponse toDTO(ViaturaEntity viaturaEntity) {
        return ViaturaResponse.builder()
                .id(viaturaEntity.getId())
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
