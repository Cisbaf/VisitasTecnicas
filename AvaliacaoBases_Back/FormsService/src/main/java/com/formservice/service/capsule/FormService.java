package com.formservice.service.capsule;


import com.formservice.entity.FormEntity;
import com.formservice.entity.dto.forms.FormRequest;
import com.formservice.entity.dto.forms.FormResponse;

import java.util.ArrayList;
import java.util.List;

public interface FormService {
    FormResponse createForm(FormRequest request);

    FormResponse getById(Long id);

    List<FormResponse> getAll();

    FormResponse update(Long id, FormRequest request);

    void deleteForm(Long id);
    ArrayList<FormEntity> getByVisitaId(Long visitaId);

}
