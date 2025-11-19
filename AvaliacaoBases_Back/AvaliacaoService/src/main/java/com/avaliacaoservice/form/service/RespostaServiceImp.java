package com.avaliacaoservice.form.service;

import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.Resposta;
import com.avaliacaoservice.form.entity.dto.campos.CamposFormResponse;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import com.avaliacaoservice.form.entity.dto.resposta.RespostaRequest;
import com.avaliacaoservice.form.entity.dto.resposta.RespostaResponse;
import com.avaliacaoservice.form.entity.emuns.CheckBox;
import com.avaliacaoservice.form.respository.CamposFormRepository;
import com.avaliacaoservice.form.respository.RespostaRepository;
import com.avaliacaoservice.form.service.capsule.FormService;
import com.avaliacaoservice.form.service.capsule.RespostaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RespostaServiceImp implements RespostaService {

    private final RespostaRepository respostaRepository;
    private final CamposFormRepository camposRepository;
    private final FormMapper mapper;
    private final FormService formService;

    public List<RespostaResponse> addRespostasToCampo(List<RespostaRequest> request, Long campoId) {
        CamposFormEntity campo = camposRepository.findById(campoId).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + campoId));

        List<Resposta> respostasParaSalvar = new ArrayList<>();

        for (RespostaRequest req : request) {
            Resposta resposta;
            List<Resposta> respostasExistentes = respostaRepository.findByCampo(campo);


            if (!respostasExistentes.isEmpty()) {
                resposta = respostasExistentes.getFirst();
                resposta.setTexto(req.texto());
                resposta.setCheckbox(req.checkbox());

                if (respostasExistentes.size() > 1) {
                    for (int i = 1; i < respostasExistentes.size(); i++) {
                        respostaRepository.delete(respostasExistentes.get(i));
                    }
                }
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

        for (RespostaRequest req : request) {
            CamposFormEntity campo = camposRepository.findById(req.campoId())
                    .orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + req.campoId()));

            List<Resposta> respostaExistente = respostaRepository.findByCampo(campo);

            Resposta resposta;
            if (!respostaExistente.isEmpty()) {
                resposta = respostaExistente.getFirst();
                resposta.setTexto(req.texto());
                resposta.setCheckbox(req.checkbox());
            } else {
                resposta = mapper.toRespostaEntity(req, campo);
                resposta.setCheckbox(req.checkbox() != null ? req.checkbox() : CheckBox.NOT_GIVEN);
            }

            respostasParaSalvar.add(resposta);
        }

        return respostaRepository.saveAll(respostasParaSalvar).stream()
                .map(mapper::toRespostaResponse)
                .toList();
    }


    public List<RespostaResponse> getRespostaByCampo(Long campoId) {
        CamposFormEntity campo = camposRepository.findById(campoId).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + campoId));

        return respostaRepository.findAllByAndCampo(campo).stream().map(mapper::toRespostaResponse).toList();
    }

    public List<RespostaResponse> getRespostasByCampoIds(List<Long> campoIds) {
        if (campoIds == null || campoIds.isEmpty()) {
            return List.of();
        }
        return respostaRepository.findAllByCampoIdIn(campoIds).stream()
                .map(mapper::toRespostaResponse)
                .toList();
    }

    public List<RespostaResponse> getRespostasByFormId(Long formId) {
        // PRIMEIRO BUSCA OS CAMPOS DO FORM, DEPOIS AS RESPOSTAS
        List<Long> campoIds = camposRepository.findByFormId(formId).stream()
                .map(CamposFormEntity::getId)
                .collect(Collectors.toList());

        return getRespostasByCampoIds(campoIds);
    }

    public List<RespostaResponse> getRespostasByVisitaId(List<Long> visitaId) {
        // BUSCA TODOS OS FORMS DA VISITA
        List<FormResponse> forms = new ArrayList<>();
        for (Long id : visitaId) {
            var form = formService.getByVisitaId(id);
            forms.addAll(form);
        }

        // COLETA TODOS OS CAMPOS IDs
        List<Long> todosCampoIds = forms.stream()
                .flatMap(form -> form.campos().stream())
                .map(CamposFormEntity::getId)
                .collect(Collectors.toList());

        return getRespostasByCampoIds(todosCampoIds);
    }

    public List<CamposFormResponse> getCampoByResposta(List<RespostaResponse> response){
        List<Long> campoIds = response.stream()
                .map(RespostaResponse::campoId)
                .collect(Collectors.toList());

        return camposRepository.findAllById(campoIds).stream().map(mapper::toCampoResponse).toList();
    }


    @Transactional
    public void deleteRespostasByCampoId(Long campoId) {
        CamposFormEntity campo = camposRepository.findById(campoId).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + campoId));
        respostaRepository.deleteAllByCampo(campo);
    }


}