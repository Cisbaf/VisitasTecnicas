package com.inspecaoservice.service.capsule;


import com.inspecaoservice.entity.dto.campos.CamposFormRequest;
import com.inspecaoservice.entity.dto.campos.CamposFormResponse;
import com.inspecaoservice.entity.dto.forms.FormResponse;

public interface CampoService {

    FormResponse addCampoToForm(Long checkListId, CamposFormRequest campo);

    CamposFormResponse findById(Long id);

    void deleteCampo(Long id);
}
