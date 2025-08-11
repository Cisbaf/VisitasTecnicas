package com.relatorioservice.service.client;

import com.relatorioservice.config.FeignClientConfig;
import com.relatorioservice.entity.fora.viatura.ViaturaEntity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "viatura", url = "${gateway.url}", configuration = FeignClientConfig.class)
public interface ViaturaServiceClient {

    @GetMapping("/viatura/base/{baseId}")
    List<ViaturaEntity> getViaturasByBase(@PathVariable Long baseId);

    @GetMapping("/viatura/{id}")
    ViaturaEntity getViaturaById(@PathVariable Long id);
}