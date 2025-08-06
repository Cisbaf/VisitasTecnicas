package com.visitaservice.controller;

import com.visitaservice.entity.EquipeTecnica;
import com.visitaservice.entity.dto.visita.VisitaRequest;
import com.visitaservice.entity.dto.visita.VisitaResponse;
import com.visitaservice.service.capsule.VisitaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.DataException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class VisitaController {
    private final VisitaService service;

    @GetMapping("/{id}")
    @Operation(summary = "Get Visita by ID", description = "Retrieve a visita by its unique identifier.")
    public ResponseEntity<VisitaResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping()
    @Operation(summary = "Get All Visitas", description = "Retrieve a list of all visitas.")
    public ResponseEntity<List<VisitaResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/exists/{id}")
    @Operation(summary = "Check if Visita exists", description = "Check if a visita exists by its ID.")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        return ResponseEntity.ok(service.existsVisitaById(id));
    }
    @GetMapping("/membros/{visitaId}")
    @Operation(summary = "Get all members of a Visita", description = "Retrieve all team members associated with a specific visita ID.")
    public ResponseEntity<List<EquipeTecnica>> getAllMembrosByVisitaId(@PathVariable Long visitaId) {
        return ResponseEntity.ok(service.getAllMembrosByVisitaId(visitaId));
    }

    @GetMapping("/periodo/{idBase}")
    @Operation(summary = "Get Visitas by Period", description = "Retrieve visitas for a specific base within a date range.")
    public ResponseEntity<List<VisitaResponse>> getAllByPeriod(@PathVariable Long idBase,
                                                               @RequestParam() LocalDate dataInicio,
                                                               @RequestParam() LocalDate  dataFim) {
        return ResponseEntity.ok(service.getAllByPeriod(idBase, dataInicio, dataFim));
    }

    @Operation(summary = "Create a new Visita", description = "Create a new visita with the provided details.")
    @PostMapping
    public ResponseEntity<VisitaResponse> createVisita(@RequestBody @Valid VisitaRequest request) {
        return ResponseEntity.ok(service.createVisita(request));
    }

    @Operation(summary = "Update an existing Visita", description = "Update the details of an existing visita by its ID.")
    @PutMapping("/{id}")
    public ResponseEntity<VisitaResponse> updateVisita(@PathVariable Long id, @RequestBody @Valid VisitaRequest request) {
        return ResponseEntity.ok(service.updateVisita(id, request));
    }

    @Operation(summary = "Delete a Visita", description = "Delete a visita by its ID.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
