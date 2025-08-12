package com.relatorioservice.service.client;

import com.relatorioservice.config.FeignClientConfig;
import com.relatorioservice.entity.fora.base.BaseEntity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "base",  configuration = FeignClientConfig.class)
public interface BaseServiceClient {

    @GetMapping("/{id}")
    BaseEntity getBaseById(@PathVariable Long id);

    @GetMapping()
    List<BaseEntity> getAllBases();
}