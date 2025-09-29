package com.inspecaoservice.service;

import com.inspecaoservice.entity.dto.campos.CamposFormRequest;
import com.inspecaoservice.entity.dto.campos.CamposFormResponse;
import com.inspecaoservice.entity.dto.forms.FormResponse;
import com.inspecaoservice.respository.CamposFormRepository;
import com.inspecaoservice.respository.FormRepository;
import com.inspecaoservice.service.capsule.CampoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CampoServiceImp implements CampoService {
    private final CamposFormRepository camposRepository;
    private final FormRepository formRepository;
    private final FormMapper mapper;

    @Override
    public FormResponse addCampoToForm(Long checkListId, CamposFormRequest campo) {
        var from = camposRepository.save(mapper.toCampoEntity(campo, formRepository.findById(checkListId).orElseThrow())).getForm();
        return mapper.toFromResponse(from);
    }

    @Override
    public void deleteCampo(Long id) {
        var campo = camposRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + id));
        camposRepository.delete(campo);
    }

    public CamposFormResponse findById(Long id) {
        var campo = camposRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Campo não encontrado com ID: " + id));
        var novo = mapper.toCampoResponse(campo);
        System.out.println(novo.toString());
        return novo;
    }
}
