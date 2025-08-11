package com.visitaservice.service.capsule;


import com.visitaservice.entity.dto.relato.RelatoRequest;
import com.visitaservice.entity.dto.relato.RelatoResponse;

import java.util.List;

public interface RelatoService {
    RelatoResponse createRelato(RelatoRequest request);

    RelatoResponse getById(Long id);

    List<RelatoResponse> getAll();

    List<RelatoResponse> getAllByVisitaId(Long visitasId);



    RelatoResponse updateRelato(Long id, RelatoRequest request);

    void delete(Long id);

}
