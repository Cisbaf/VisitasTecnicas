package com.relatorioservice.service.client;

import com.relatorioservice.entity.fora.Visita.EquipeTecnica;
import com.relatorioservice.entity.fora.Visita.RelatoEntity;
import com.relatorioservice.entity.fora.Visita.VisitaEntity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "visita", url = "${gateway.url}")
public interface VisitaServiceClient {

    @GetMapping("/visita/{id}")
    VisitaEntity getVisitaById(@PathVariable Long id);

    @GetMapping("/visita/membros/{visitaId}")
    List<EquipeTecnica> getAllMembrosByVisitaId(@PathVariable Long visitaId);

    @GetMapping("/visita/relatos/visita/{visitaId}")
    List<RelatoEntity> getRelatosByVisita(@PathVariable Long visitaId);
}