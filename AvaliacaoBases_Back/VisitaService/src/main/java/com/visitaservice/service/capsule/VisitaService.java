package com.visitaservice.service.capsule;

import com.visitaservice.entity.EquipeTecnica;
import com.visitaservice.entity.dto.visita.VisitaRequest;
import com.visitaservice.entity.dto.visita.VisitaResponse;

import java.time.LocalDate;
import java.util.List;

public interface VisitaService {
    VisitaResponse createVisita(VisitaRequest request);

    VisitaResponse addMembroToVisita(Long visitaId, EquipeTecnica membro);

    VisitaResponse getById(Long id);

    List<VisitaResponse> getAll();

    List<EquipeTecnica> getAllMembrosByVisitaId(Long visitaId);

    List<VisitaResponse> getAllByPeriod(Long idBase, LocalDate dataInicio, LocalDate dataFim);


    VisitaResponse updateVisita(Long id, VisitaRequest request);

    void delete(Long id);
    VisitaResponse removeMembroFromVisita(Long visitaId, EquipeTecnica membro);

    Boolean existsVisitaById(Long id);

    List<VisitaResponse> getVisitaByIdBase(Long idBase);
}
