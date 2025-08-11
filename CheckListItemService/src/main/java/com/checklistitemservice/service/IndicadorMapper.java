package com.checklistitemservice.service;

import com.checklistitemservice.entity.IndicadorOpEntity;
import com.checklistitemservice.entity.dto.BaseRankingDTO;
import com.checklistitemservice.entity.dto.IndicadorRequest;
import com.checklistitemservice.entity.dto.IndicadorResponse;
import com.checklistitemservice.service.capsule.RelatorioServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
class IndicadorMapper {

    private final RelatorioServiceClient client;

    IndicadorResponse toResponse(com.checklistitemservice.entity.IndicadorOpEntity entity) {
        if (entity == null) {
            return null;
        }
        return IndicadorResponse.builder()
                .id(entity.getId())
                .TIHs(entity.getTIHs())
                .atendimentos(entity.getAtendimentos())
                .rankingBases(entity.getRankingBases())
                .build();
    }

    IndicadorOpEntity toEntity(IndicadorRequest request) {
        if (request == null) {
            return null;
        }

        List<BaseRankingDTO> rankingBases;

        if (request.dataInicio() != null && request.dataFim() != null) {
            rankingBases = client.getRankingVisitas(request.dataInicio(), request.dataFim());
        } else {
            rankingBases = client.getRankingVisitas(LocalDate.now().withDayOfYear(1), LocalDate.now());
        }

        return IndicadorOpEntity.builder()
                .TIHs(request.TIHs())
                .atendimentos(request.atendimentos())
                .rankingBases(rankingBases)
                .build();
    }
}
