package com.checklistitemservice.controller;

import com.checklistitemservice.entity.dto.IndicadorRequest;
import com.checklistitemservice.entity.dto.IndicadorResponse;
import com.checklistitemservice.service.capsule.IndicadorService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/indicador-op")
@RequiredArgsConstructor
public class IndicadorOpController {
    private final IndicadorService indicadorService;

    @GetMapping("/{id}")
    @Operation(summary = "Get Indicador by ID", description = "Retrieve an indicador by its unique identifier.")
    public ResponseEntity<IndicadorResponse> findById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        IndicadorResponse response = indicadorService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all Indicadores", description = "Retrieve a list of all indicadores.")
    public ResponseEntity<List<IndicadorResponse>> findAll() {
        List<IndicadorResponse> responses = indicadorService.getAll();
        if (responses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @Operation(summary = "Create a new Indicador", description = "Create a new indicador with the provided details.")
    public ResponseEntity<IndicadorResponse> create(@RequestBody @Valid IndicadorRequest indicadorRequest) {
        if (indicadorRequest == null) {
            return ResponseEntity.badRequest().build();
        }
        IndicadorResponse response = indicadorService.save(indicadorRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Indicador by ID", description = "Update an existing indicador by its unique identifier.")
    public ResponseEntity<IndicadorResponse> update(@RequestBody @Valid IndicadorRequest indicadorRequest, @PathVariable Long id) {
        if (indicadorRequest == null || id == null) {
            return ResponseEntity.badRequest().build();
        }
        IndicadorResponse response = indicadorService.update(id, indicadorRequest);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Indicador by ID", description = "Delete an indicador by its unique identifier.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        indicadorService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
