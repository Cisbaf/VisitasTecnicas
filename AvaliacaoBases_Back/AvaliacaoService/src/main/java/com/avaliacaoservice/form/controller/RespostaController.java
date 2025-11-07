package com.avaliacaoservice.form.controller;

import com.avaliacaoservice.form.entity.dto.resposta.RespostaRequest;
import com.avaliacaoservice.form.entity.dto.resposta.RespostaResponse;
import com.avaliacaoservice.form.service.capsule.RespostaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/answers")
@RequiredArgsConstructor
public class RespostaController {

    private final RespostaService service;

    @GetMapping
    @Operation(summary = "Get answers by field and visit", description = "Retrieve answers for a specific field in a form based on visit ID")
    public ResponseEntity<List<RespostaResponse>> findRespostasByCampoAndVisita(@RequestParam Long campoId, @RequestParam Long visitId) {
        return ResponseEntity.ok().body(this.service.getRespostaByCampoAndVisita(campoId, visitId));
    }

    @PostMapping({"/all"})
    @Operation(summary = "Get answers by field and visit", description = "Retrieve answers for a specific field in a form based on visit ID")
    public ResponseEntity<List<RespostaResponse>> findAllRespostas(@RequestBody Map<String, List<Long>> request) {
        List<Long> visitIds = request.get("visitIds");
        return ResponseEntity.ok().body(this.service.getAllResposta(visitIds));
    }

    @GetMapping({"/visit/{visitaId}"})
    @Operation(summary = "Get answers by visit ID", description = "Retrieve all answers associated with a specific visit ID")
    public ResponseEntity<List<RespostaResponse>> findRespostasByVisitaId(@PathVariable Long visitaId) {
        return ResponseEntity.ok().body(this.service.getRespostasByVisitaId(visitaId));
    }

    @PostMapping({"/saveAnswers/{campoId}"})
    @Operation(summary = "Add answers to field", description = "Add answers to a specific field in a form")
    public ResponseEntity<List<RespostaResponse>> addRespostasToCampo(@RequestBody @Valid List<RespostaRequest> respostas, @PathVariable Long campoId) {
        return ResponseEntity.ok().body(this.service.addRespostasToCampo(respostas, campoId));
    }

    @PostMapping({"/saveAnswers"})
    @Operation(summary = "Add answers to field", description = "Add answers")
    public ResponseEntity<List<RespostaResponse>> addRespostas(@RequestBody @Valid List<RespostaRequest> respostas) {
        return ResponseEntity.ok().body(this.service.addRespostas(respostas));
    }

    @DeleteMapping({"/visit/{visitaId}"})
    @Operation(summary = "Delete answers by visit ID", description = "Delete all answers associated with a specific visit ID")
    public ResponseEntity<Void> deleteRespostasByVisitaId(@PathVariable Long visitaId) {
        this.service.deleteRespostasByVisitaId(visitaId);
        return ResponseEntity.noContent().build();
    }
}