package com.viaturaservice.service;


import com.viaturaservice.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Service
@FeignClient(name = "base", configuration = FeignClientConfig.class)
public interface IdBaseExists {
    @GetMapping("/exists/{id}")
    boolean existsById(@PathVariable("id") Long id);
}
