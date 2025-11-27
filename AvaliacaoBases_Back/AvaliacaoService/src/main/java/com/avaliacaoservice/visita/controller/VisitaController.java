package com.avaliacaoservice.visita.controller;

import com.avaliacaoservice.visita.entity.EquipeTecnica;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaRequest;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaResponse;
import com.avaliacaoservice.visita.service.capsule.VisitaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/visitas")
@RequiredArgsConstructor
public class VisitaController {

    private final VisitaService service;

    @GetMapping({"/{id}"})
    @Operation(summary = "Get Visita by ID", description = "Retrieve a visita by its unique identifier.")
    public ResponseEntity<VisitaResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(this.service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Get All Visitas", description = "Retrieve a list of all visitas.")
    public ResponseEntity<List<VisitaResponse>> getAll() {
        return ResponseEntity.ok(this.service.getAll());
    }

    @GetMapping({"/exists/{id}"})
    @Operation(summary = "Check if Visita exists", description = "Check if a visita exists by its ID.")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        return ResponseEntity.ok(this.service.existsVisitaById(id));
    }

    @GetMapping({"/membros/{visitaId}"})
    @Operation(summary = "Get all members of a Visita", description = "Retrieve all team members associated with a specific visita ID.")
    public ResponseEntity<List<EquipeTecnica>> getAllMembrosByVisitaId(@PathVariable Long visitaId) {
        return ResponseEntity.ok(this.service.getAllMembrosByVisitaId(visitaId));
    }


    @GetMapping({"/periodo/{idBase}"})
    @Operation(summary = "Get Visitas by Period and BaseID", description = "Retrieve visitas for a specific base within a date range.")
    public ResponseEntity<List<VisitaResponse>> getBaseByPeriod(@PathVariable Long idBase, @RequestParam LocalDate dataInicio, @RequestParam LocalDate dataFim) {
        return ResponseEntity.ok(this.service.getBaseByPeriod(idBase, dataInicio, dataFim));
    }

    @GetMapping({"/periodo"})
    @Operation(summary = "Get Visitas by Period", description = "Retrieve visitas within a date range.")
    public ResponseEntity<List<VisitaResponse>> getAllByPeriod(@RequestParam LocalDate dataInicio, @RequestParam LocalDate dataFim) {
        return ResponseEntity.ok(this.service.getAllByPeriod(dataInicio, dataFim));
    }

    @GetMapping({"/base/{idBase}"})
    @Operation(summary = "Get Visitas by Base ID", description = "Retrieve visitas associated with a specific base ID.")
    public ResponseEntity<List<VisitaResponse>> getAllByBaseId(@PathVariable Long idBase) {
        return ResponseEntity.ok(this.service.getVisitaByIdBase(idBase));
    }

    @Operation(summary = "Create a new Visita", description = "Create a new visita with the provided details.")
    @PostMapping
    public ResponseEntity<VisitaResponse> createVisita(@RequestBody @Valid VisitaRequest request) {
        return ResponseEntity.ok(this.service.createVisita(request));
    }

    @PostMapping({"/membro/{id}"})
    @Operation(summary = "Add a member to a Visita", description = "Add a team member to an existing visita by its ID.")
    public ResponseEntity<VisitaResponse> addMembroToVisita(@PathVariable Long id, @RequestBody @Valid EquipeTecnica membro) {
        return ResponseEntity.ok(this.service.addMembroToVisita(id, membro));
    }


    @Operation(summary = "Update an existing Visita", description = "Update the details of an existing visita by its ID.")
    @PutMapping({"/{id}"})
    public ResponseEntity<VisitaResponse> updateVisita(@PathVariable Long id, @RequestBody @Valid VisitaRequest request) {
        return ResponseEntity.ok(this.service.updateVisita(id, request));
    }

    @Operation(summary = "Delete a Visita", description = "Delete a visita by its ID.")
    @DeleteMapping({"/{id}"})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        this.service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete all Visitas by Base ID", description = "Delete all visitas associated with a specific base ID.")
    @DeleteMapping({"/base/{idBase}"})
    public ResponseEntity<Void> deleteAllByBaseId(@PathVariable Long idBase) {
        this.service.deleteAllByBaseId(idBase);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping({"/membro/{visitaId}"})
    @Operation(summary = "Remove a member from a Visita", description = "Remove a team member from an existing visita by its ID.")
    public ResponseEntity<VisitaResponse> removeMembroFromVisita(@PathVariable Long visitaId, @RequestBody @Valid EquipeTecnica membro) {
        return ResponseEntity.ok(this.service.removeMembroFromVisita(visitaId, membro));
    }
}


