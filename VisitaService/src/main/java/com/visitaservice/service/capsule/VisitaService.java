package com.visitaservice.service.capsule;

import com.visitaservice.entity.EquipeTecnica;
import com.visitaservice.entity.dto.visita.VisitaRequest;
import com.visitaservice.entity.dto.visita.VisitaResponse;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface VisitaService {
     VisitaResponse createVisita(VisitaRequest request);

     VisitaResponse getById(Long id);

     List<VisitaResponse> getAll();

     List<EquipeTecnica> getAllMembrosByVisitaId(Long visitaId);
     List<VisitaResponse> getAllByPeriod(Long idBase, LocalDate dataInicio, LocalDate dataFim);


          VisitaResponse updateVisita(Long id, VisitaRequest request);

     void delete(Long id);

     Boolean existsVisitaById(Long id);
}
