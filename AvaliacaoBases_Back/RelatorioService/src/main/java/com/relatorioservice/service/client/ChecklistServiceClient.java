package com.relatorioservice.service.client;

import com.relatorioservice.config.FeignClientConfig;
import com.relatorioservice.entity.fora.checklist.AvaliacaoEntity;
import com.relatorioservice.entity.fora.checklist.CheckListEntity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "checklist", configuration = FeignClientConfig.class)
public interface ChecklistServiceClient {

    @GetMapping("/visita/{visitaId}")
    List<CheckListEntity> findByVisitaId(@PathVariable Long visitaId);

    @GetMapping("/{id}")
    CheckListEntity getCheckListById(@PathVariable Long id);

    @GetMapping("/visita/{visitaId}")
    List<AvaliacaoEntity> getAvaliacoesByVisita(@PathVariable Long visitaId);
}