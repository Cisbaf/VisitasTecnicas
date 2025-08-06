package com.arquivomidia.service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "checklist")
public interface DescriptionClient {
    @GetMapping("/descexists/{id}")
    boolean existsDescricaoById(@PathVariable("id") Long id);
}
