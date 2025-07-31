package com.visitaservice.service.capsule;

import com.visitaservice.entity.VisitaRequest;
import com.visitaservice.entity.VisitaResponse;

import java.util.List;

public interface VisitaService {
     VisitaResponse createVisita(VisitaRequest request);

     VisitaResponse getById(Long id);

     List<VisitaResponse> getAll();

     VisitaResponse updateVisita(Long id, VisitaRequest request);

     void delete(Long id);

     Boolean existsVisitaById(Long id);
}
