package com.inspecaoservice.service.capsule;


import com.inspecaoservice.entity.FormEntity;
import com.inspecaoservice.entity.dto.forms.FormRequest;
import com.inspecaoservice.entity.dto.forms.FormResponse;
import com.inspecaoservice.entity.emuns.TipoForm;

import java.util.ArrayList;
import java.util.List;

public interface FormService {
    FormResponse createForm(FormRequest request);

    FormResponse getById(Long id);

    List<FormResponse> getAll();

    FormResponse update(Long id, FormRequest request);

    void deleteForm(Long id);
    ArrayList<FormEntity> getByVisitaId(Long visitaId);

    List<FormResponse> getAllByTipo(TipoForm tipoForm);

}
