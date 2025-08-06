package com.checklistitemservice.service;

import com.checklistitemservice.entity.CheckListEntity;
import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
import com.checklistitemservice.entity.enums.TipoConformidade;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
class CheckListMapper {

    CheckListResponse toResponse(CheckListEntity entity) {
        if (entity == null) {
            return null;
        }
        return CheckListResponse.builder()
                .id(entity.getId())
                .categoria(entity.getCategoria())
                .descricao(entity.getDescricao())
                .visitaId(entity.getVisitaId())
                .build();
    }

    CheckListEntity toEntity(CheckListRequest request) {
        if (request == null) {
            return null;
        }
        var descricao = request.descricao();
        for( var desc : descricao) {
            if (desc.getConformidadePercent() <= 44) {
                desc.setTipoConformidade(TipoConformidade.NAO_CONFORME);
            } else if (desc.getConformidadePercent() >= 70) {
                desc.setTipoConformidade(TipoConformidade.CONFORME);
            } else {
                desc.setTipoConformidade(TipoConformidade.PARCIAL);

            }
        }

        return CheckListEntity.builder()
                .categoria(request.categoria())
                .descricao(descricao)
                .visitaId(request.visitaId())
                .build();
    }

}
