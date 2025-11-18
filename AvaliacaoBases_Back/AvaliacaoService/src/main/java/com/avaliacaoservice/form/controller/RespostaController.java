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

@RestController
@RequestMapping("/answers")
@RequiredArgsConstructor
public class RespostaController {

    private final RespostaService service;

    @PostMapping("/all")
    @Operation(summary = "Get all answers", description = "Retrieve all answers in the system")
    public ResponseEntity<List<RespostaResponse>> getAllRespostas(@RequestBody List<Long> visitaIds) {
        return ResponseEntity.ok().body(service.getRespostasByVisitaId(visitaIds));
    }

    @GetMapping({"/field/{campoId}"})
    @Operation(summary = "Get answers by field ID", description = "Retrieve all answers associated with a specific field ID")
    public ResponseEntity<List<RespostaResponse>> getRespostasByCampo(@PathVariable Long campoId) {
        return ResponseEntity.ok().body(service.getRespostaByCampo(campoId));
    }

    @GetMapping({"/form/{formId}"})
    @Operation(summary = "Get answers by form ID", description = "Retrieve all answers associated with a specific form ID")
    public ResponseEntity<List<RespostaResponse>> getRespostasByFormId(@PathVariable Long formId) {
        return ResponseEntity.ok().body(service.getRespostasByFormId(formId));
    }

    @PostMapping({"/fields"})
    @Operation(summary = "Get answers by field IDs", description = "Retrieve all answers associated with a list of field IDs")
    public ResponseEntity<List<RespostaResponse>> getRespostasByCampoIds(@RequestBody List<Long> campoIds) {
        return ResponseEntity.ok().body(service.getRespostasByCampoIds(campoIds));
    }

    @PostMapping({"/saveAnswers/{campoId}"})
    @Operation(summary = "Add answers to field", description = "Add answers to a specific field in a form")
    public ResponseEntity<List<RespostaResponse>> addRespostasToCampo(@RequestBody @Valid List<RespostaRequest> respostas, @PathVariable Long campoId) {
        return ResponseEntity.ok().body(service.addRespostasToCampo(respostas, campoId));
    }

    @PostMapping({"/saveAnswers"})
    @Operation(summary = "Add answers to field", description = "Add answers")
    public ResponseEntity<List<RespostaResponse>> addRespostas(@RequestBody @Valid List<RespostaRequest> respostas) {
        return ResponseEntity.ok().body(service.addRespostas(respostas));
    }

    @DeleteMapping({"/visit/{visitaId}"})
    @Operation(summary = "Delete answers by visit ID", description = "Delete all answers associated with a specific visit ID")
    public ResponseEntity<Void> deleteRespostasByCampoId(@PathVariable Long campoId) {
        service.deleteRespostasByCampoId(campoId);
        return ResponseEntity.noContent().build();
    }
}