package com.formservice.service;

import com.formservice.entity.CamposFormEntity;
import com.formservice.entity.dto.forms.FormRequest;
import com.formservice.entity.dto.forms.FormResponse;
import com.formservice.respository.FormRepository;
import com.formservice.service.capsule.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormServiceImp implements FormService {
    private final FormMapper mapper;
    private final FormRepository formRepository;

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

    @Override
    public List<FormResponse> getAll() {
        return formRepository.findAll().stream()
                .map(mapper::toFromResponse)
                .toList();
    }

    @Override
    public FormResponse update(Long id, FormRequest request) {
        var form = formRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(nullMessage + id));

        form.setCategoria(request.categoria());

        List<CamposFormEntity> campos = request.campos().stream()
                .map(c -> mapper.toCampoEntity(c, form))
                .collect(Collectors.toList());

        form.setCampos(campos);

        return mapper.toFromResponse(formRepository.save(form));
    }

    @Override
    public void deleteForm(Long id) {
        var form = formRepository.findById(id).orElseThrow(() -> new IllegalArgumentException(nullMessage + id));
        formRepository.delete(form);
    }
}
