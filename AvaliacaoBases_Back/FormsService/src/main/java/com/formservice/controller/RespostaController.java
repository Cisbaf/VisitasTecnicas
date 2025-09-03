package com.formservice.controller;

import com.formservice.entity.dto.resposta.RespostaRequest;
import com.formservice.entity.dto.resposta.RespostaResponse;
import com.formservice.service.capsule.RespostaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RespostaController {
    private final RespostaService service;

    @GetMapping("/answers")
    @Operation(summary = "Get answers by field and visit", description = "Retrieve answers for a specific field in a form based on visit ID")
    public ResponseEntity<List<RespostaResponse>> findRespostasByCampoAndVisita(@RequestParam Long campoId, @RequestParam Long visitId) {
        var resposta = service.getRespostaByCampoAndVisita(campoId, visitId);
        return ResponseEntity.ok().body(resposta);
    }

    @GetMapping("/answers/visit/{visitaId}")
    @Operation(summary = "Get answers by visit ID", description = "Retrieve all answers associated with a specific visit ID")
    public ResponseEntity<List<RespostaResponse>> findRespostasByVisitaId(@PathVariable Long visitaId) {
        var resposta = service.getRespostasByVisitaId(visitaId);
        return ResponseEntity.ok().body(resposta);
    }

    @PostMapping("/answers/saveAnswers/{campoId}")
    @Operation(summary = "Add answers to field", description = "Add answers to a specific field in a form")
    public ResponseEntity<List<RespostaResponse>> addRespostasToCampo(@RequestBody @Valid List<RespostaRequest> respostas, @PathVariable Long campoId) {
        return ResponseEntity.ok().body(service.addRespostas(respostas, campoId));
    }
}
