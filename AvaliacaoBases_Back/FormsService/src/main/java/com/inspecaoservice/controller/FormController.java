package com.inspecaoservice.controller;

import com.inspecaoservice.entity.FormEntity;
import com.inspecaoservice.entity.dto.forms.FormRequest;
import com.inspecaoservice.entity.dto.forms.FormResponse;
import com.inspecaoservice.service.capsule.FormService;
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

    @GetMapping("/type/{tipoForm}")
    @Operation(summary = "Get forms by type", description = "Retrieve a list of forms filtered by type")
    public ResponseEntity<List<FormResponse>> findAllByTipo(@PathVariable String tipoForm) {
        try {
            return ResponseEntity.ok().body(service.getAllByTipo(Enum.valueOf(com.inspecaoservice.entity.emuns.TipoForm.class, tipoForm.toUpperCase())));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get form by ID", description = "Retrieve a form by its ID")
    public ResponseEntity<FormResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok().body(service.getById(id));
    }

    @GetMapping("/visita/{visitaId}")
    @Operation(summary = "Get forms by Visita ID", description = "Retrieve a list of forms associated with a specific Visita ID")
    public ResponseEntity<List<FormEntity>> findByVisitaId(@PathVariable Long visitaId) {
        var forms = service.getByVisitaId(visitaId);
        return ResponseEntity.ok().body(forms);
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
