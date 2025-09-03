package com.formservice.controller;

import com.formservice.entity.dto.forms.FormRequest;
import com.formservice.entity.dto.forms.FormResponse;
import com.formservice.service.capsule.FormService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FormController {
    private final FormService service;

    @GetMapping
    @Operation(summary = "Get all forms", description = "Retrieve a list of all forms")
    public ResponseEntity<List<FormResponse>> findAll() {

        return ResponseEntity.ok().body(service.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get form by ID", description = "Retrieve a form by its ID")
    public ResponseEntity<FormResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok().body(service.getById(id));
    }

    @PostMapping("/saveForm")
    @Operation(summary = "Create a new form", description = "Create a new form with the provided details")
    public ResponseEntity<FormResponse> createForm(@RequestBody @Valid FormRequest formRequest) {
        return ResponseEntity.ok().body(service.createForm(formRequest));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update form by ID", description = "Update an existing form by its ID with the provided details")
    public ResponseEntity<FormResponse> updateForm(@PathVariable Long id, @RequestBody @Valid FormRequest formRequest) {
        return ResponseEntity.ok().body(service.update(id, formRequest));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete form by ID", description = "Delete an existing form by its ID")
    public ResponseEntity<Void> deleteForm(@PathVariable Long id) {
        service.deleteForm(id);
        return ResponseEntity.noContent().build();
    }
}
