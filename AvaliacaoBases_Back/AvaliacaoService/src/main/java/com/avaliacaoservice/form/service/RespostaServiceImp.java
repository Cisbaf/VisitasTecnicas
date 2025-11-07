package com.avaliacaoservice.form.service;

import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.Resposta;
import com.avaliacaoservice.form.entity.dto.resposta.RespostaRequest;
import com.avaliacaoservice.form.entity.dto.resposta.RespostaResponse;
import com.avaliacaoservice.form.entity.emuns.CheckBox;
import com.avaliacaoservice.form.respository.CamposFormRepository;
import com.avaliacaoservice.form.respository.RespostaRepository;
import com.avaliacaoservice.form.service.capsule.RespostaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class RespostaServiceImp implements RespostaService {

    private final RespostaRepository respostaRepository;
    private final CamposFormRepository camposRepository;
    private final FormMapper mapper;

    public List<RespostaResponse> addRespostasToCampo(List<RespostaRequest> request, Long campoId) {
        CamposFormEntity campo = this.camposRepository.findById(campoId).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + campoId));

        List<Resposta> respostasParaSalvar = new ArrayList<>();

        for (RespostaRequest req : request) {
            Resposta resposta;
            List<Resposta> respostasExistentes = this.respostaRepository.findByCampoAndVisitaId(campo, req.visitaId());


            if (!respostasExistentes.isEmpty()) {
                resposta = respostasExistentes.getFirst();
                resposta.setTexto(req.texto());
                resposta.setCheckbox(req.checkbox());

                if (respostasExistentes.size() > 1) {
                    for (int i = 1; i < respostasExistentes.size(); i++) {
                        this.respostaRepository.delete(respostasExistentes.get(i));
                    }
                }
            } else {
                resposta = this.mapper.toRespostaEntity(req, campo);
                if (req.checkbox() != null) {
                    resposta.setCheckbox(req.checkbox());
                } else {
                    resposta.setCheckbox(CheckBox.NOT_GIVEN);
                }
            }

            respostasParaSalvar.add(resposta);
        }

        return this.respostaRepository.saveAll(respostasParaSalvar).stream()
                .map(this.mapper::toRespostaResponse)
                .toList();
    }


    public List<RespostaResponse> addRespostas(List<RespostaRequest> request) {
        List<Resposta> respostasParaSalvar = new ArrayList<>();


        for (RespostaRequest req : request) {
            Resposta resposta;
            CamposFormEntity campo = this.camposRepository.findById(req.campoId()).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + req.campoId()));

            List<Resposta> respostaExistente = this.respostaRepository.findByCampoAndVisitaId(campo, req.visitaId());

            if (!respostaExistente.isEmpty()) {
                resposta = respostaExistente.getFirst();
                resposta.setTexto(req.texto());

                resposta.setCheckbox(req.checkbox());
            } else {
                resposta = this.mapper.toRespostaEntity(req, campo);

                if (req.checkbox() != null) {
                    resposta.setCheckbox(req.checkbox());
                } else {
                    resposta.setCheckbox(CheckBox.NOT_GIVEN);
                }
            }


            respostasParaSalvar.add(resposta);
        }


        Objects.requireNonNull(this.mapper);
        return this.respostaRepository.saveAll(respostasParaSalvar).stream().map(this.mapper::toRespostaResponse)
                .toList();
    }


    public List<RespostaResponse> getAllResposta(List<Long> visitIds) {
        List<Resposta> respostas = new ArrayList<>();
        for (Long id : visitIds) {
            List<Resposta> resp = this.respostaRepository.findAllByVisitaId(id);


            Objects.requireNonNull(respostas);
            resp.stream().filter(r -> (r.getCampo() != null)).forEach(respostas::add);
        }
        Objects.requireNonNull(this.mapper);
        return respostas.stream().map(this.mapper::toRespostaResponse).toList();
    }


    public List<RespostaResponse> getRespostaByCampoAndVisita(Long campoId, Long visitId) {
        CamposFormEntity campo = this.camposRepository.findById(campoId).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + campoId));

        Objects.requireNonNull(this.mapper);
        return this.respostaRepository.findAllByVisitaIdAndCampo(visitId, campo).stream().map(this.mapper::toRespostaResponse).toList();
    }


    public List<RespostaResponse> getRespostasByVisitaId(Long visitaId) {
        List<Resposta> respostas = this.respostaRepository.findAllByVisitaId(visitaId);


        Objects.requireNonNull(this.mapper);
        return respostas.stream().filter(r -> (r.getCampo() != null)).map(this.mapper::toRespostaResponse)
                .toList();
    }


    @Transactional
    public void deleteRespostasByVisitaId(Long visitaId) {
        this.respostaRepository.deleteAllByVisitaId(visitaId);
    }
}