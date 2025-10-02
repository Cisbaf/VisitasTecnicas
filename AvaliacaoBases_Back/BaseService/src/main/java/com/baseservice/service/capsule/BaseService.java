package com.baseservice.service.capsule;

import com.baseservice.entity.BaseRequest;
import com.baseservice.entity.BaseResponse;

import java.util.List;

public interface BaseService {
     BaseResponse createBase(BaseRequest viaturaDTO);

     BaseResponse getByName(String name);

     BaseResponse getById(Long id);

     List<BaseResponse> getAll();

     BaseResponse update(Long id, BaseRequest viaturaDTO);

     void deleteBase(Long id);
     boolean existsById(Long id);
}
