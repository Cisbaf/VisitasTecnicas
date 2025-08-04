package com.viaturaservice.controller;

import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaResponse;
import com.viaturaservice.service.IdBaseExists;
import com.viaturaservice.service.capsule.ViaturaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ViaturaController {
    private final ViaturaService viaturaService;
    private final IdBaseExists exists;

    @Operation(summary = "Get all Viaturas", description = "Retrieve a list of all viaturas.")
    @GetMapping
    public ResponseEntity<List<ViaturaResponse>> findAll() {
        return ResponseEntity.ok(viaturaService.getAllViaturas());
    }

    @Operation(summary = "Get Viatura by ID", description = "Retrieve a viatura by its unique identifier.")
    @GetMapping("/{id}")
    public ResponseEntity<ViaturaResponse> findById(@PathVariable Long id) {
        var viaturaRequest = viaturaService.getViaturaById(id);
        if (viaturaRequest != null) {
            return ResponseEntity.ok(viaturaRequest);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Check if Viatura exists by ID", description = "Check if a viatura exists by its ID.")
    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        boolean exists = viaturaService.existsViaturaById(id);
        return ResponseEntity.ok(exists);
    }

    @Operation(summary = "Create a new Viatura", description = "Create a new viatura with the provided details.")
    @PostMapping
    public ResponseEntity<ViaturaResponse> save(@RequestBody @Valid ViaturaRequest viaturaRequest) {
        if (viaturaRequest == null || !exists.existsById(viaturaRequest.idBase())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(viaturaService.createViatura(viaturaRequest));
    }

    @DeleteMapping
    @Operation(summary = "Delete a Viatura by ID", description = "Delete a viatura by its unique identifier.")
    public ResponseEntity<Void> deleteById(Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        viaturaService.deleteViatura(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Viatura", description = "Update the details of an existing viatura by its ID.")
    public ResponseEntity<ViaturaResponse> update(@PathVariable Long id, @RequestBody @Valid ViaturaRequest viaturaRequest) {
        if (id == null || viaturaRequest == null) {
            return ResponseEntity.badRequest().build();
        }
        ViaturaResponse updatedViatura = viaturaService.updateViatura(id, viaturaRequest);
        return ResponseEntity.ok(updatedViatura);
    }

}
