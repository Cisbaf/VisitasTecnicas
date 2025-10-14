package com.formservice.service.capsule;


import com.formservice.entity.dto.resposta.RespostaRequest;
import com.formservice.entity.dto.resposta.RespostaResponse;

import java.util.List;

public interface RespostaService {

    List<RespostaResponse> getAllResposta(List<Long> visitaIds);
    List<RespostaResponse> getRespostaByCampoAndVisita(Long campoId, Long formId);

    List<RespostaResponse> addRespostasToCampo(List<RespostaRequest> request, Long campoId);

    List<RespostaResponse> addRespostas(List<RespostaRequest> request);

    List<RespostaResponse> getRespostasByVisitaId(Long visitaId);

    void deleteRespostasByVisitaId(Long visitaId);
}
