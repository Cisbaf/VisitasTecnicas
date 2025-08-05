package com.relatorioservice.service.client;

import com.relatorioservice.entity.fora.checklist.AvaliacaoEntity;
import com.relatorioservice.entity.fora.checklist.CheckListEntity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "checklist", url = "${gateway.url}")
public interface ChecklistServiceClient {

    @GetMapping("/checklist/visita/{visitaId}")
    List<CheckListEntity> findByVisitaId(@PathVariable Long visitaId);

    @GetMapping("/checklist/{id}")
    CheckListEntity getCheckListById(@PathVariable Long id);

    @GetMapping("/avaliacao/visita/{visitaId}")
    List<AvaliacaoEntity> getAvaliacoesByVisita(@PathVariable Long visitaId);
}