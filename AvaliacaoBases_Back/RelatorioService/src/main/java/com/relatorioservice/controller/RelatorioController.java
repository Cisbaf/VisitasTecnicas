package com.relatorioservice.controller;

import com.relatorioservice.entity.dtos.BaseRankingDTO;
import com.relatorioservice.entity.dtos.RelatorioConsolidadoResponse;
import com.relatorioservice.entity.dtos.RelatorioTecnicoResponse;
import com.relatorioservice.service.RelatorioTecnicoService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioTecnicoService relatorioService;

    @GetMapping("/tecnico/{visitaId}")
    @Operation(summary = "Gera um relatório técnico para uma visita específica")
    public ResponseEntity<RelatorioTecnicoResponse> gerarRelatorio(@PathVariable Long visitaId) {
        return ResponseEntity.ok(relatorioService.gerarRelatorio(visitaId, LocalDate.of(2001, 1, 1), LocalDate.now()));
    }

    @GetMapping("/consolidado/{idBase}")
    @Operation(summary = "Gera um relatório consolidado para uma base em um período específico")
    public ResponseEntity<RelatorioConsolidadoResponse> getRelatorioConsolidadoComBase(
            @PathVariable Long idBase,
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fim) {

        return ResponseEntity.ok(relatorioService.gerarRelatoriosPorPeriodIdBase(idBase, inicio, fim));
    }
    @GetMapping("/consolidado")
    @Operation(summary = "Gera um relatório consolidado para uma base em um período específico")
    public ResponseEntity<List<RelatorioTecnicoResponse>> getRelatorioConsolidado(
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fim) {

        return ResponseEntity.ok(relatorioService.gerarRelatoriosPorPeriodo(inicio, fim));
    }
    @GetMapping("/ranking")
    @Operation(summary = "Gera um relatório de ranking de visitas")
    public ResponseEntity<List<BaseRankingDTO>> getRankingVisitas(
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fim) {
        return ResponseEntity.ok(relatorioService.getRankingBasesPeriodoAtual(inicio, fim));
    }
}