package com.checklistitemservice.service.capsule;

import com.checklistitemservice.entity.dto.IndicadorRequest;
import com.checklistitemservice.entity.dto.IndicadorResponse;

import java.util.List;

public interface IndicadorService {

    IndicadorResponse getById(Long id);

    List<IndicadorResponse> getAll();

    IndicadorResponse save(IndicadorRequest request);

    IndicadorResponse update(Long id, IndicadorRequest request);

    void delete(Long id);
}
