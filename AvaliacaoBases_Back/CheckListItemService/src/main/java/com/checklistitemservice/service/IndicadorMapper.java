package com.checklistitemservice.service;

import com.checklistitemservice.entity.IndicadorOpEntity;
import com.checklistitemservice.entity.dto.IndicadorRequest;
import com.checklistitemservice.entity.dto.IndicadorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
class IndicadorMapper {


    IndicadorResponse toResponse(com.checklistitemservice.entity.IndicadorOpEntity entity) {
        if (entity == null) {
            return null;
        }
        return IndicadorResponse.builder()
                .id(entity.getId())
                .TIHs(entity.getTIHs())
                .atendimentos(entity.getAtendimentos())
                .build();
    }

    IndicadorOpEntity toEntity(IndicadorRequest request) {
        if (request == null) {
            return null;
        }




        return IndicadorOpEntity.builder()
                .TIHs(request.TIHs())
                .atendimentos(request.atendimentos())
                .build();
    }
}
