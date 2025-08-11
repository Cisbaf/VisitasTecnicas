package com.arquivomidia.service.client;

import com.arquivomidia.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "visita", configuration = FeignClientConfig.class)
public interface VisitaClient {
    @GetMapping("/exists/{id}")
    boolean existsVisitaById(@PathVariable("id") Long id);
}
