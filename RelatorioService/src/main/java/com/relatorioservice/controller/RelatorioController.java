package com.relatorioservice.controller;

import com.relatorioservice.entity.dtos.RelatorioConsolidadoResponse;
import com.relatorioservice.entity.dtos.RelatorioTecnicoResponse;
import com.relatorioservice.service.RelatorioTecnicoService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Date;

@RestController
@RequestMapping("/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioTecnicoService relatorioService;

    @GetMapping("/tecnico/{visitaId}")
    @Operation(summary = "Gera um relatório técnico para uma visita específica")
    public ResponseEntity<RelatorioTecnicoResponse> gerarRelatorio(@PathVariable Long visitaId) {
        return ResponseEntity.ok(relatorioService.gerarRelatorio(visitaId));
    }

    @GetMapping("/consolidado/{idBase}")
    @Operation(summary = "Gera um relatório consolidado para uma base em um período específico")
    public ResponseEntity<RelatorioConsolidadoResponse> getRelatorioConsolidado(
            @PathVariable Long idBase,
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fim) {

        return ResponseEntity.ok(relatorioService.gerarRelatoriosPorPeriodo(idBase, inicio, fim));
    }
}