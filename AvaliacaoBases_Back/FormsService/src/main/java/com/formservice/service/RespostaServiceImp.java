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
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RespostaServiceImp implements RespostaService {
    private final RespostaRepository respostaRepository;
    private final CamposFormRepository camposRepository;
    private final FormMapper mapper;

    public List<RespostaResponse> addRespostasToCampo(List<RespostaRequest> request, Long campoId) {
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

    public List<RespostaResponse> addRespostas(List<RespostaRequest> request) {

        List<Resposta> respostasParaSalvar = new ArrayList<>();

        int index = 0;
        for (RespostaRequest req : request) {
            var campo = camposRepository.findById(req.campoId())
                    .orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + req.campoId()));

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
            index++;
        }

        return respostaRepository.saveAll(respostasParaSalvar).stream()
                .map(mapper::toRespostaResponse)
                .toList();
    }

    @Override
    public List<RespostaResponse> getAllResposta(List<Long> visitIds) {
        List<Resposta> respostas = new ArrayList<>();
        for (Long id : visitIds) {
            var resp = respostaRepository.findAllByVisitaId(id);
            resp.stream()
                    .filter(r -> r.getCampo() != null)
                    .forEach(respostas::add);
        }
        return respostas.stream().map(mapper::toRespostaResponse).toList();
    }

    @Override
    public List<RespostaResponse> getRespostaByCampoAndVisita(Long campoId, Long visitId) {
        var campo = camposRepository.findById(campoId).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + campoId));

        return respostaRepository.findAllByVisitaIdAndCampo(visitId, campo).stream().map(mapper::toRespostaResponse).toList();
    }

    @Override
    public List<RespostaResponse> getRespostasByVisitaId(Long visitaId) {
        List<Resposta> respostas = respostaRepository.findAllByVisitaId(visitaId);
        return respostas.stream()
                .filter(r -> r.getCampo() != null)
                .map(mapper::toRespostaResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteRespostasByVisitaId(Long visitaId) {
        respostaRepository.deleteAllByVisitaId(visitaId);
    }

}
