package com.viaturaservice.service;

import com.viaturaservice.entity.ViaturaEntity;
import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class ViaturaMapper {
    private final BaseService exists;

    protected ViaturaEntity toEntity(ViaturaRequest viaturaRequest) {
        if (exists.existsById(viaturaRequest.idBase())) {
            return ViaturaEntity.builder()
                    .placa(viaturaRequest.placa().toUpperCase())
                    .tipoViatura(viaturaRequest.tipoViatura())
                    .statusOperacional(viaturaRequest.statusOperacional())
                    .idBase(viaturaRequest.idBase())
                    .build();
        }
        throw new IllegalArgumentException("Base ID does not exist: " + viaturaRequest.idBase());
    }

    protected static ViaturaResponse toDTO(ViaturaEntity viaturaEntity) {
        return ViaturaResponse.builder()
                .id(viaturaEntity.getId())
                .placa(viaturaEntity.getPlaca())
                .km(viaturaEntity.getKm().startsWith("0") ? "0" : viaturaEntity.getKm())
                .tipoViatura(viaturaEntity.getTipoViatura())
                .statusOperacional(viaturaEntity.getStatusOperacional())
                .idBase(viaturaEntity.getIdBase())
                .dataInclusao(viaturaEntity.getDataInclusao())
                .dataUltimaAlteracao(viaturaEntity.getDataUltimaAlteracao())
                .build();
    }
}
