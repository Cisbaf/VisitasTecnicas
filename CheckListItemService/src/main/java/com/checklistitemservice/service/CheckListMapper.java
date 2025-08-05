package com.checklistitemservice.service;

import com.checklistitemservice.entity.CheckListEntity;
import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
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
        return CheckListEntity.builder()
                .categoria(request.categoria())
                .descricao(request.descricao())
                .visitaId(request.visitaId())
                .build();
    }

}
