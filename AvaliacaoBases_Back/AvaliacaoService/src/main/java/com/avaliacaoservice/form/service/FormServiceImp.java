package com.avaliacaoservice.form.service;

import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.FormEntity;
import com.avaliacaoservice.form.entity.Resposta;
import com.avaliacaoservice.form.entity.dto.forms.FormRequest;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import com.avaliacaoservice.form.entity.emuns.TipoForm;
import com.avaliacaoservice.form.respository.FormRepository;
import com.avaliacaoservice.form.respository.RespostaRepository;
import com.avaliacaoservice.form.service.capsule.FormService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FormServiceImp implements FormService {
    private final FormMapper mapper;
    private final FormRepository formRepository;

    private final RespostaRepository respostaRepository;

    public FormResponse createForm(FormRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null");
        }
        FormEntity form = this.formRepository.save(this.mapper.toFormEntity(request));
        return this.mapper.toFromResponse(form);
    }


    public FormResponse getById(Long id) {
        Objects.requireNonNull(this.mapper);
        return this.formRepository.findById(id).map(this.mapper::toFromResponse)
                .orElseThrow(() -> new IllegalArgumentException("Formulario não encontrado com ID: " + id));
    }

    public ArrayList<FormEntity> getByVisitaId(Long visitaId) {
        List<Resposta> respostas = this.respostaRepository.findAllByVisitaId(visitaId);

        return respostas.stream().filter(m -> (m.getCampo() != null))
                .map(resposta -> resposta.getCampo().getForm())
                .distinct().collect(Collectors.toCollection(ArrayList::new));
    }


    public List<FormResponse> getAll() {
        Objects.requireNonNull(this.mapper);
        return this.formRepository.findAll().stream().map(this.mapper::toFromResponse)
                .toList();
    }


    public List<FormResponse> getAllByTipo(TipoForm tipoForm) {
        TipoForm tipo = TipoForm.valueOf(String.valueOf(tipoForm));

        Objects.requireNonNull(this.mapper);
        return this.formRepository.findByTipoForm(tipo).stream().map(this.mapper::toFromResponse)
                .toList();
    }


    public FormResponse update(Long id, FormRequest request) {
        try {
            FormEntity form = this.formRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Formulario não encontrado com ID: " + id));

            List<CamposFormEntity> novosCampos = request
                    .campos()
                    .stream()
                    .map(c -> this.mapper.toCampoEntity(c, form))
                    .toList();

            form.getCampos().clear();

            form.getCampos().addAll(novosCampos);
            form.setSummaryId(request.summaryId() != null ? request.summaryId() : form.getSummaryId());
            form.setCategoria(request.categoria() != null ? request.categoria() : form.getCategoria());
            form.getCampos().forEach(c -> c.setForm(form));
            form.setTipoForm(request.summaryId() != null && request.summaryId() == 2L ? TipoForm.PADRONIZACAO : TipoForm.INSPECAO);


            return this.mapper.toFromResponse(formRepository.save(form));
        } catch (Exception e) {
            log.error("Erro ao atualizar formulário com ID: {}. Detalhes do erro: {}", id, e.getMessage());
            throw e;
        }

    }


    public void deleteForm(Long id) {
        FormEntity form = this.formRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Formulario não encontrado com ID: " + id));
        this.formRepository.delete(form);
    }
}