package com.arquivomidia.service.client;

import com.arquivomidia.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "checklist", configuration = FeignClientConfig.class)
public interface DescriptionClient {
    @GetMapping("/descexists/{id}")
    boolean existsDescricaoById(@PathVariable("id") Long id);
}
