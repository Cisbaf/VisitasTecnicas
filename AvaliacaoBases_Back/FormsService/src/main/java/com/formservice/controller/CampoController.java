package com.formservice.controller;

import com.formservice.entity.dto.campos.CamposFormRequest;
import com.formservice.entity.dto.campos.CamposFormResponse;
import com.formservice.entity.dto.forms.FormResponse;
import com.formservice.service.capsule.CampoService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CampoController {
    private final CampoService service;

    @GetMapping("/field/{id}")
    @Operation(summary = "Get field by ID", description = "Retrieve a field by its ID")
    public ResponseEntity<CamposFormResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok().body(service.findById(id));
    }
    @GetMapping("/fields")
    @Operation(summary = "Get all fields", description = "Retrieve all fields")
    public ResponseEntity<java.util.List<CamposFormResponse>> findAll() {
        return ResponseEntity.ok().body(service.findAll());
    }

    @PostMapping("/saveField")
    @Operation(summary = "Add field to form", description = "Add a new field to an existing form")
    public ResponseEntity<FormResponse> addCampoToForm(@RequestParam Long formId, @RequestBody @Valid CamposFormRequest campo) {
        return ResponseEntity.ok().body(service.addCampoToForm(formId, campo));
    }

    @DeleteMapping("/field/{id}")
    @Operation(summary = "Delete field by ID", description = "Delete a field from a form by its ID")
    public ResponseEntity<Void> deleteField(@PathVariable Long id) {
        service.deleteCampo(id);
        return ResponseEntity.noContent().build();
    }
}
