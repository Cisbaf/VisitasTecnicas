package com.relatorioservice.service.client;

import com.relatorioservice.entity.fora.base.BaseEntity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "base", url = "${gateway.url}")
public interface BaseServiceClient {

    @GetMapping("/base/{id}")
    BaseEntity getBaseById(@PathVariable Long id);

}