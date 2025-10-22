package com.viaturaservice.service;


import com.viaturaservice.config.FeignClientConfig;
import com.viaturaservice.entity.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Optional;

@Service
@FeignClient(name = "base", configuration = FeignClientConfig.class)
public interface BaseService {
    @GetMapping("/exists/{id}")
    boolean existsById(@PathVariable("id") Long id);

    @GetMapping("/name")
    Optional<BaseResponse> getByName(@RequestParam("name") String name);

    @GetMapping("/{id}")
    BaseResponse getById(@PathVariable("id") Long id);

    @GetMapping()
    List<BaseResponse> getAllBases();

}
