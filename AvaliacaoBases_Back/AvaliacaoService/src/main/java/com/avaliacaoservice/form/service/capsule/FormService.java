package com.avaliacaoservice.form.service.capsule;

import com.avaliacaoservice.form.entity.FormEntity;
import com.avaliacaoservice.form.entity.dto.forms.FormRequest;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import com.avaliacaoservice.form.entity.emuns.TipoForm;
import java.util.ArrayList;
import java.util.List;

public interface FormService {
  FormResponse createForm(FormRequest paramFormRequest);
  
  FormResponse getById(Long paramLong);
  
  List<FormResponse> getAll();
  
  FormResponse update(Long paramLong, FormRequest paramFormRequest);
  
  void deleteForm(Long paramLong);
  
  ArrayList<FormEntity> getByVisitaId(Long paramLong);
  
  List<FormResponse> getAllByTipo(TipoForm paramTipoForm);
}