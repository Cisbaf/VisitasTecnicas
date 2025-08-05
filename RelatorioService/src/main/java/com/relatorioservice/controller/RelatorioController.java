package com.relatorioservice.controller;

import com.relatorioservice.entity.dtos.RelatorioTecnicoResponse;
import com.relatorioservice.service.RelatorioTecnicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioTecnicoService relatorioService;

    @GetMapping("/tecnico/{visitaId}")
    public ResponseEntity<RelatorioTecnicoResponse> gerarRelatorio(@PathVariable Long visitaId) {
        return ResponseEntity.ok(relatorioService.gerarRelatorio(visitaId));
    }
}