package com.viaturaservice.service.capsule;

import com.viaturaservice.entity.ViaturaDTO;

import java.util.List;

public interface ViaturaService {
     ViaturaDTO createViatura(ViaturaDTO viaturaDTO);

     ViaturaDTO getViaturaById(Long id);

     List<ViaturaDTO> getAllViaturas();

     ViaturaDTO updateViatura(Long id, ViaturaDTO viaturaDTO);

     void deleteViatura(Long id);
}
