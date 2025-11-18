package com.avaliacaoservice.form.service.capsule;

import com.avaliacaoservice.form.entity.dto.resposta.RespostaRequest;
import com.avaliacaoservice.form.entity.dto.resposta.RespostaResponse;

import java.util.List;

public interface RespostaService {

    List<RespostaResponse> getRespostaByCampo(Long campoId);

    List<RespostaResponse> getRespostasByFormId(Long formId);

    List<RespostaResponse> addRespostasToCampo(List<RespostaRequest> paramList, Long paramLong);

    List<RespostaResponse> addRespostas(List<RespostaRequest> paramList);

    void deleteRespostasByCampoId(Long campoId);

    List<RespostaResponse> getRespostasByCampoIds(List<Long> campoIds);

    List<RespostaResponse> getRespostasByVisitaId(List<Long> visitaId);

}
