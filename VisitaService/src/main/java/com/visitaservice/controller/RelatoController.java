package com.visitaservice.controller;

import com.visitaservice.entity.dto.relato.RelatoRequest;
import com.visitaservice.entity.dto.relato.RelatoResponse;
import com.visitaservice.service.capsule.RelatoService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/relatos")
@RequiredArgsConstructor
public class RelatoController {
    private final RelatoService service;

    @GetMapping
    @Operation(summary = "Get All Relatos", description = "Retrieve a list of all relatos.")
    public ResponseEntity<List<RelatoResponse>> getAll() {
        List<RelatoResponse> relatos = service.getAll();
        if (relatos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(relatos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Relato by ID", description = "Retrieve a relato by its unique identifier.")
    public ResponseEntity<RelatoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }
    @GetMapping("/visita/{visitaId}")
    @Operation(summary = "Get Relatos by Visita ID", description = "Retrieve all relatos associated with a specific visita ID.")
    public ResponseEntity<List<RelatoResponse>> getByVisitaId(@PathVariable Long visitaId) {
        List<RelatoResponse> relatos = service.getAllByVisitaId(visitaId);
        if (relatos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(relatos);
    }

    @PostMapping
    @Operation(summary = "Create a new Relato", description = "Create a new relato with the provided details.")
    public ResponseEntity<RelatoResponse> create(@RequestBody @Valid RelatoRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        RelatoResponse response = service.createRelato(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Relato", description = "Update the details of an existing relato by its ID.")
    public ResponseEntity<RelatoResponse> update(@PathVariable Long id, @RequestBody @Valid RelatoRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        RelatoResponse response = service.updateRelato(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Relato", description = "Delete a relato by its ID.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
