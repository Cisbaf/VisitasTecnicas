package com.relatorioservice.service.client;

import com.relatorioservice.config.FeignClientConfig;
import com.relatorioservice.entity.fora.Visita.EquipeTecnica;
import com.relatorioservice.entity.fora.Visita.VisitaEntity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@FeignClient(name = "visita", configuration = FeignClientConfig.class)
public interface VisitaServiceClient {

    @GetMapping("/{id}")
    VisitaEntity getVisitaById(@PathVariable Long id);

    @GetMapping("/membros/{visitaId}")
    List<EquipeTecnica> getAllMembrosByVisitaId(@PathVariable Long visitaId);

    @GetMapping("/periodo/{idBase}")
    List<VisitaEntity> getBaseByPeriodAndBaseId(@PathVariable Long idBase,
                                                @RequestParam() LocalDate dataInicio,
                                                @RequestParam() LocalDate dataFim);

    @GetMapping("/periodo")
    List<VisitaEntity> getAllByPeriod(@RequestParam() LocalDate dataInicio, @RequestParam() LocalDate dataFim);
}