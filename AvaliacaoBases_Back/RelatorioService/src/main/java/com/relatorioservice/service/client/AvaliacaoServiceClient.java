package com.relatorioservice.service.client;

import com.relatorioservice.config.FeignClientConfig;
import com.relatorioservice.entity.fora.checklist.AvaliacaoEntity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "avaliacao", configuration = FeignClientConfig.class)
public interface AvaliacaoServiceClient {

    @GetMapping("/visita/{visitaId}")
    List<AvaliacaoEntity> getAvaliacoesByVisita(@PathVariable Long visitaId);
}