package com.authservice.service.capsule;

import com.authservice.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "base",  configuration = FeignClientConfig.class)
public interface BaseServiceClient {

    @GetMapping("/exists/{id}")
    Boolean existsById(@PathVariable Long id);
}