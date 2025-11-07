package com.avaliacaoservice.viatura.service.capsule;

import com.avaliacaoservice.viatura.entity.ViaturaRequest;
import com.avaliacaoservice.viatura.entity.ViaturaResponse;
import com.avaliacaoservice.viatura.entity.dto.VeiculoDto;
import java.util.List;

public interface ViaturaService {
  ViaturaResponse createViatura(ViaturaRequest paramViaturaRequest);
  
  ViaturaResponse getViaturaById(Long paramLong);
  
  List<ViaturaResponse> getAllViaturasByIdBase(Long paramLong);
  
  List<ViaturaResponse> getVeiculoFromApiByPeriodo(Long paramLong, String paramString1, String paramString2);
  
  List<ViaturaResponse> getVeiculoFromApiByPeriodo(String paramString1, String paramString2);
  
  VeiculoDto getVeiculoFromApi(String paramString);
  
  boolean existsViaturaById(Long paramLong);
  
  List<ViaturaResponse> getAllViaturas();
  
  ViaturaResponse updateViatura(Long paramLong, ViaturaRequest paramViaturaRequest);
  
  void deleteViatura(Long paramLong);
  
  void deleteAllByBaseId(Long paramLong);
}