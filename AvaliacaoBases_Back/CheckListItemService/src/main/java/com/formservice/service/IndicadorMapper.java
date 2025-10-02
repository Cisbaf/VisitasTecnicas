package com.formservice.service;

import com.formservice.entity.IndicadorOpEntity;
import com.formservice.entity.dto.IndicadorRequest;
import com.formservice.entity.dto.IndicadorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
class IndicadorMapper {


    IndicadorResponse toResponse(com.formservice.entity.IndicadorOpEntity entity) {
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
