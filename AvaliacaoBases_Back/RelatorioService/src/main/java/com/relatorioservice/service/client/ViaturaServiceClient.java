package com.relatorioservice.service.client;

import com.relatorioservice.config.FeignClientConfig;
import com.relatorioservice.entity.fora.viatura.ViaturaEntity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "viatura", configuration = FeignClientConfig.class)
public interface ViaturaServiceClient {

    @GetMapping("/base/{baseId}")
    List<ViaturaEntity> getViaturasByBase(@PathVariable Long baseId);

    @GetMapping("/api")
    List<ViaturaEntity> findByPeriodo(@RequestParam Long baseId, @RequestParam String data_inicio, @RequestParam String data_final);

}