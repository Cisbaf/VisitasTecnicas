package com.avaliacaoservice.form.service.capsule;

import com.avaliacaoservice.form.entity.dto.resposta.RespostaRequest;
import com.avaliacaoservice.form.entity.dto.resposta.RespostaResponse;
import java.util.List;

public interface RespostaService {
  List<RespostaResponse> getAllResposta(List<Long> paramList);
  
  List<RespostaResponse> getRespostaByCampoAndVisita(Long paramLong1, Long paramLong2);
  
  List<RespostaResponse> addRespostasToCampo(List<RespostaRequest> paramList, Long paramLong);
  
  List<RespostaResponse> addRespostas(List<RespostaRequest> paramList);
  
  List<RespostaResponse> getRespostasByVisitaId(Long paramLong);
  
  void deleteRespostasByVisitaId(Long paramLong);
}
