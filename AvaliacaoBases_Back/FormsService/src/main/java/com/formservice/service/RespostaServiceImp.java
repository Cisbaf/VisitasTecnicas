package com.formservice.service;

import com.formservice.entity.Resposta;
import com.formservice.entity.dto.resposta.RespostaRequest;
import com.formservice.entity.dto.resposta.RespostaResponse;
import com.formservice.entity.emuns.CheckBox;
import com.formservice.respository.CamposFormRepository;
import com.formservice.respository.RespostaRepository;
import com.formservice.service.capsule.RespostaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RespostaServiceImp implements RespostaService {
    private final RespostaRepository respostaRepository;
    private final CamposFormRepository camposRepository;
    private final FormMapper mapper;

    public List<RespostaResponse> addRespostas(List<RespostaRequest> request, Long campoId) {
        var campo = camposRepository.findById(campoId)
                .orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + campoId));

        List<Resposta> respostasParaSalvar = new ArrayList<>();

        for (RespostaRequest req : request) {
            Optional<Resposta> respostaExistente = respostaRepository.getByCampoAndVisitaId(campo, req.visitaId());

            Resposta resposta;

            if (respostaExistente.isPresent()) {
                resposta = respostaExistente.get();
                resposta.setTexto(req.texto());

                resposta.setCheckbox(req.checkbox());
            } else {
                resposta = mapper.toRespostaEntity(req, campo);

                if (req.checkbox() != null) {
                    resposta.setCheckbox(req.checkbox());
                } else {
                    resposta.setCheckbox(CheckBox.NOT_GIVEN);
                }
            }

            respostasParaSalvar.add(resposta);
        }

        return respostaRepository.saveAll(respostasParaSalvar).stream()
                .map(mapper::toRespostaResponse)
                .toList();
    }
    @Override
    public List<RespostaResponse> getRespostaByCampoAndVisita(Long campoId, Long visitId) {
        var campo = camposRepository.findById(campoId).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + campoId));

        return respostaRepository.findAllByVisitaIdAndCampo(visitId, campo).stream().map(mapper::toRespostaResponse).toList();
    }
    @Override
    public List<RespostaResponse> getRespostasByVisitaId(Long visitaId) {
        return respostaRepository.findAllByVisitaId(visitaId).stream().map(mapper::toRespostaResponse).toList();
    }

}
