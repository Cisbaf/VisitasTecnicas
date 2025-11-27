package com.avaliacaoservice.base.service.capsule;

import com.avaliacaoservice.base.entity.BaseRequest;
import com.avaliacaoservice.base.entity.BaseResponse;
import java.util.List;

public interface BaseService {
  BaseResponse createBase(BaseRequest paramBaseRequest);
  
  BaseResponse getByName(String paramString);
  
  BaseResponse getById(Long paramLong);
  
  List<BaseResponse> getAll();
  
  BaseResponse update(Long paramLong, BaseRequest paramBaseRequest);
  
  void deleteBase(Long paramLong);
  
  boolean existsById(Long paramLong);
}
