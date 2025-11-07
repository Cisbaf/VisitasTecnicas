package com.avaliacaoservice.visita.service.capsule;

import com.avaliacaoservice.visita.entity.EquipeTecnica;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaRequest;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaResponse;

import java.time.LocalDate;
import java.util.List;

public interface VisitaService {
    VisitaResponse createVisita(VisitaRequest paramVisitaRequest);

    VisitaResponse addMembroToVisita(Long paramLong, EquipeTecnica paramEquipeTecnica);

    VisitaResponse getById(Long paramLong);

    List<VisitaResponse> getAll();

    List<EquipeTecnica> getAllMembrosByVisitaId(Long paramLong);

    List<VisitaResponse> getBaseByPeriod(Long paramLong, LocalDate paramLocalDate1, LocalDate paramLocalDate2);

    List<VisitaResponse> getAllByPeriod(LocalDate paramLocalDate1, LocalDate paramLocalDate2);

    VisitaResponse updateVisita(Long paramLong, VisitaRequest paramVisitaRequest);

    void delete(Long paramLong);

    void deleteAllByBaseId(Long paramLong);

    VisitaResponse removeMembroFromVisita(Long paramLong, EquipeTecnica paramEquipeTecnica);

    Boolean existsVisitaById(Long paramLong);

    List<VisitaResponse> getVisitaByIdBase(Long paramLong);
}

