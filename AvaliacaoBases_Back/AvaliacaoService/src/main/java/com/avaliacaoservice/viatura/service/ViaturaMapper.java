package com.avaliacaoservice.viatura.service;

import com.avaliacaoservice.base.service.capsule.BaseService;
import com.avaliacaoservice.viatura.entity.ViaturaEntity;
import com.avaliacaoservice.viatura.entity.ViaturaRequest;
import com.avaliacaoservice.viatura.entity.ViaturaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class ViaturaMapper {

    private final BaseService exists;

    protected ViaturaEntity toEntity(ViaturaRequest viaturaRequest) {
        if (this.exists.existsById(viaturaRequest.idBase())) {
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
                .dataInclusao(viaturaEntity.getDataInclusao().toString())
                .dataUltimaAlteracao(viaturaEntity.getDataUltimaAlteracao())
                .build();
    }
}