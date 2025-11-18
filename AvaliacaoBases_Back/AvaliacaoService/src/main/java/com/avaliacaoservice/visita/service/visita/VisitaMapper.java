package com.avaliacaoservice.visita.service.visita;

import com.avaliacaoservice.base.service.capsule.BaseService;
import com.avaliacaoservice.visita.entity.EquipeTecnica;
import com.avaliacaoservice.visita.entity.VisitaEntity;
import com.avaliacaoservice.visita.entity.dto.visita.EquipeTecnicaResponse;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaRequest;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
class VisitaMapper {

    private final BaseService exists;

    protected VisitaEntity toEntity(VisitaRequest request) {
        if (exists.existsById(request.getIdBase())) {
            return VisitaEntity.builder()
                    .idBase(request.getIdBase())
                    .dataVisita(request.getDataVisita())
                    .membros(request.getMembros())
                    .tipoVisita(request.getTipoVisita())
                    .build();
        }
        throw new IllegalArgumentException("Base ID does not exist: " + request.getIdBase());
    }

    protected static EquipeTecnicaResponse toEquipeResponse(EquipeTecnica membro) {
        return EquipeTecnicaResponse.builder()
                .id(membro.getId())
                .nome(membro.getNome())
                .cargo(membro.getCargo())
                .visitaId(membro.getVisita() != null ? membro.getVisita().getId() : null)
                .build();
    }

    protected static VisitaResponse toResponse(VisitaEntity visita) {

        return VisitaResponse.builder()
                .id(visita.getId())
                .idBase(visita.getIdBase())
                .dataVisita(visita.getDataVisita())
                .membros(visita.getMembros() != null ? visita.getMembros().stream()
                        .map(VisitaMapper::toEquipeResponse)
                        .toList() : null)
                .tipoVisita(visita.getTipoVisita())
                .build();
    }
}

