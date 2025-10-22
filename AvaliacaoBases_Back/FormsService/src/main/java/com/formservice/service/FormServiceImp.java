package com.formservice.service;

import com.formservice.entity.CamposFormEntity;
import com.formservice.entity.FormEntity;
import com.formservice.entity.dto.forms.FormRequest;
import com.formservice.entity.dto.forms.FormResponse;
import com.formservice.entity.emuns.TipoForm;
import com.formservice.respository.FormRepository;
import com.formservice.respository.RespostaRepository;
import com.formservice.service.capsule.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormServiceImp implements FormService {
    private final FormMapper mapper;
    private final FormRepository formRepository;
    private final RespostaRepository respostaRepository;

    private final String nullMessage = "Formulario não encontrado com ID: ";

    @Override
    public FormResponse createForm(FormRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null");
        }
        var form = formRepository.save(mapper.toFormEntity(request));
        return mapper.toFromResponse(form);
    }

    @Override
    public FormResponse getById(Long id) {
        return formRepository.findById(id).map(mapper::toFromResponse)
                .orElseThrow(() -> new IllegalArgumentException(nullMessage + id));
    }

    public ArrayList<FormEntity> getByVisitaId(Long visitaId) {
        var respostas = respostaRepository.findAllByVisitaId(visitaId);

        return respostas.stream().filter(m -> m.getCampo() != null)
                .map(resposta -> resposta.getCampo().getForm())
                .distinct().collect(Collectors.toCollection(ArrayList::new));
    }

    @Override
    public List<FormResponse> getAll() {
        return formRepository.findAll().stream()
                .map(mapper::toFromResponse)
                .toList();
    }

    @Override
    public List<FormResponse> getAllByTipo(TipoForm tipoForm) {
        var tipo = TipoForm.valueOf(String.valueOf(tipoForm));
        return formRepository.findByTipoForm(tipo).stream()
                .map(mapper::toFromResponse)
                .toList();
    }

    @Override
    public FormResponse update(Long id, FormRequest request) {
        var form = formRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(nullMessage + id));


        List<CamposFormEntity> campos = request.campos().stream()
                .map(c -> mapper.toCampoEntity(c, form))
                .toList();
        form.getCampos().clear();
        form.setCampos(campos);
        form.setSummaryId(request.summaryId());
        form.setCategoria(request.categoria());
        form.setTipoForm(request.summaryId() == 2 ? TipoForm.PADRONIZACAO : TipoForm.INSPECAO);

        return mapper.toFromResponse(formRepository.save(form));
    }

    @Override
    public void deleteForm(Long id) {
        var form = formRepository.findById(id).orElseThrow(() -> new IllegalArgumentException(nullMessage + id));
        formRepository.delete(form);
    }
}
