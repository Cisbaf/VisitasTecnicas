package com.avaliacaoservice.visita.service.capsule;

import com.avaliacaoservice.visita.entity.dto.relato.RelatoRequest;
import com.avaliacaoservice.visita.entity.dto.relato.RelatoResponse;
import java.util.List;

public interface RelatoService {
  RelatoResponse createRelato(RelatoRequest paramRelatoRequest);
  
  RelatoResponse getById(Long paramLong);
  
  List<RelatoResponse> getAll();
  
  List<RelatoResponse> getAllByVisitaId(Long paramLong);
  
  List<RelatoResponse> getAllByBaseId(Long paramLong);
  
  RelatoResponse updateRelato(Long paramLong, RelatoRequest paramRelatoRequest);
  
  void delete(Long paramLong);
}

