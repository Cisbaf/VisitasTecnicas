package com.avaliacaoservice.form.service;

import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.FormEntity;
import com.avaliacaoservice.form.entity.dto.campos.CamposFormRequest;
import com.avaliacaoservice.form.entity.dto.campos.CamposFormResponse;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import com.avaliacaoservice.form.respository.CamposFormRepository;
import com.avaliacaoservice.form.respository.FormRepository;
import com.avaliacaoservice.form.service.capsule.CampoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CampoServiceImp implements CampoService {


    private final CamposFormRepository camposRepository;
    private final FormRepository formRepository;
    private final FormMapper mapper;

    public List<CamposFormResponse> findAll() {
        return this.camposRepository.findAll().stream().map(FormMapper::toCampoResponse).toList();
    }


    public FormResponse addCampoToForm(Long checkListId, CamposFormRequest campo) {
        FormEntity from = this.camposRepository.save(this.mapper.toCampoEntity(campo, this.formRepository.findById(checkListId).orElseThrow())).getForm();
        return this.mapper.toFromResponse(from);
    }


    public void deleteCampo(Long id) {
        CamposFormEntity campo = this.camposRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + id));
        this.camposRepository.delete(campo);
    }

    public CamposFormResponse findById(Long id) {
        CamposFormEntity campo = this.camposRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + id));
        return FormMapper.toCampoResponse(campo);
    }
}

