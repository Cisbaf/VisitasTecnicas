package com.checklistitemservice.service;

import com.checklistitemservice.entity.CheckListEntity;
import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
import com.checklistitemservice.entity.enums.TipoConformidade;
import org.springframework.stereotype.Service;

@Service
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

        var entity = CheckListEntity.builder()
                .categoria(request.categoria())
                .visitaId(request.visitaId())
                .build();

        var descricao = request.descricao();
        for (var desc : descricao) {
            desc.setId(null);
            if (desc.getConformidadePercent() <= 44) {
                desc.setTipoConformidade(TipoConformidade.NAO_CONFORME);
            } else if (desc.getConformidadePercent() >= 70) {
                desc.setTipoConformidade(TipoConformidade.CONFORME);
            } else {
                desc.setTipoConformidade(TipoConformidade.PARCIAL);
            }
        }

        entity.setDescricao(descricao);


        return entity;
    }
}