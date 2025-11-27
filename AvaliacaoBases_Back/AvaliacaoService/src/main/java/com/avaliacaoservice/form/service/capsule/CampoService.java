package com.avaliacaoservice.form.service.capsule;

import com.avaliacaoservice.form.entity.dto.campos.CamposFormRequest;
import com.avaliacaoservice.form.entity.dto.campos.CamposFormResponse;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import java.util.List;

public interface CampoService {
  List<CamposFormResponse> findAll();
  
  FormResponse addCampoToForm(Long paramLong, CamposFormRequest paramCamposFormRequest);
  
  CamposFormResponse findById(Long paramLong);
  
  void deleteCampo(Long paramLong);
}


