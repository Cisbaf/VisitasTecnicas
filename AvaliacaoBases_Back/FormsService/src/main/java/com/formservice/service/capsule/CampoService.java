package com.formservice.service.capsule;


import com.formservice.entity.dto.campos.CamposFormRequest;
import com.formservice.entity.dto.campos.CamposFormResponse;
import com.formservice.entity.dto.forms.FormResponse;

import java.util.List;

public interface CampoService {

    List<CamposFormResponse> findAll();

    FormResponse addCampoToForm(Long checkListId, CamposFormRequest campo);

    CamposFormResponse findById(Long id);

    void deleteCampo(Long id);
}
