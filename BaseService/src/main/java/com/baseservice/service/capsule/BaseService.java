package com.baseservice.service.capsule;

import com.baseservice.entity.BaseDTO;

import java.util.List;

public interface BaseService {
     BaseDTO createBase(BaseDTO viaturaDTO);

     BaseDTO getById(Long id);

     List<BaseDTO> getAll();

     BaseDTO update(Long id, BaseDTO viaturaDTO);

     void deleteBase(Long id);
     boolean existsById(Long id);
}
