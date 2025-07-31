package com.viaturaservice.service.capsule;

import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaResponse;

import java.util.List;

public interface ViaturaService {
     ViaturaResponse createViatura(ViaturaRequest viaturaRequest);

     ViaturaResponse getViaturaById(Long id);

     List<ViaturaResponse> getAllViaturas();

     ViaturaResponse updateViatura(Long id, ViaturaRequest viaturaRequest);

     void deleteViatura(Long id);
}
