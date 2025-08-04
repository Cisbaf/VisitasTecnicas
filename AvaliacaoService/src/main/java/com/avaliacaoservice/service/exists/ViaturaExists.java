package com.avaliacaoservice.service.exists;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "viatura")
public interface ViaturaExists {
    @GetMapping("/exists/{id}")
    boolean existsViaturaById(@PathVariable("id") Long id);
}
