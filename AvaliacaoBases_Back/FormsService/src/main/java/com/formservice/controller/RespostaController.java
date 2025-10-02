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
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RespostaController {
    private final RespostaService service;

    @GetMapping("/answers")
    @Operation(summary = "Get answers by field and visit", description = "Retrieve answers for a specific field in a form based on visit ID")
    public ResponseEntity<List<RespostaResponse>> findRespostasByCampoAndVisita(@RequestParam Long campoId, @RequestParam Long visitId) {
        return ResponseEntity.ok().body(service.getRespostaByCampoAndVisita(campoId, visitId));
    }

    @PostMapping("/answers/all")
    @Operation(summary = "Get answers by field and visit", description = "Retrieve answers for a specific field in a form based on visit ID")
    public ResponseEntity<List<RespostaResponse>> findAllRespostas(@RequestBody Map<String, List<Long>> request) {
        List<Long> visitIds = request.get("visitIds");
        System.out.println(visitIds);

        var result = service.getAllResposta(visitIds);
        System.out.println("Respsotas: " + result);

        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/answers/visit/{visitaId}")
    @Operation(summary = "Get answers by visit ID", description = "Retrieve all answers associated with a specific visit ID")
    public ResponseEntity<List<RespostaResponse>> findRespostasByVisitaId(@PathVariable Long visitaId) {
        return ResponseEntity.ok().body(service.getRespostasByVisitaId(visitaId));
    }

    @PostMapping("/answers/saveAnswers/{campoId}")
    @Operation(summary = "Add answers to field", description = "Add answers to a specific field in a form")
    public ResponseEntity<List<RespostaResponse>> addRespostasToCampo(@RequestBody @Valid List<RespostaRequest> respostas, @PathVariable Long campoId) {
        return ResponseEntity.ok().body(service.addRespostas(respostas, campoId));
    }

    @DeleteMapping("/answers/visit/{visitaId}")
    @Operation(summary = "Delete answers by visit ID", description = "Delete all answers associated with a specific visit ID")
    public ResponseEntity<Void> deleteRespostasByVisitaId(@PathVariable Long visitaId) {
        service.deleteRespostasByVisitaId(visitaId);
        return ResponseEntity.noContent().build();
    }
}
