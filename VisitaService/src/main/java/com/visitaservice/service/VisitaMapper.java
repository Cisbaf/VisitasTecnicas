package com.visitaservice.service;


import com.visitaservice.entity.VisitaEntity;
import com.visitaservice.entity.VisitaRequest;
import com.visitaservice.entity.VisitaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
class VisitaMapper {
    private final IdBaseExists exists;

    protected VisitaEntity toEntity(VisitaRequest request) {
        if (exists.existsById(request.getIdBase())) {
            return VisitaEntity.builder()
                    .idBase(request.getIdBase())
                    .dataVisita(request.getDataVisita())
                    .membros(request.getMembros())
                    .build();
        }
        throw new IllegalArgumentException("Base ID does not exist: " + request.getIdBase());
    }

    protected static VisitaResponse toResponse(VisitaEntity visita) {
        return VisitaResponse.builder()
                .id(visita.getId())
                .idBase(visita.getIdBase())
                .dataVisita(visita.getDataVisita())
                .membros(visita.getMembros())
                .build();
    }
}
