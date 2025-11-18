package com.avaliacaoservice.form.controller;

import com.avaliacaoservice.form.entity.dto.forms.FormRequest;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import com.avaliacaoservice.form.entity.emuns.TipoForm;
import com.avaliacaoservice.form.service.capsule.FormService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/form")
@RequiredArgsConstructor
public class FormController {

    private final FormService service;

    @GetMapping
    @Operation(summary = "Get all forms", description = "Retrieve a list of all forms")
    public ResponseEntity<List<FormResponse>> findAll() {
        return ResponseEntity.ok().body(this.service.getAll());
    }

    @GetMapping({"/type/{tipoForm}"})
    @Operation(summary = "Get forms by type", description = "Retrieve a list of forms filtered by type")
    public ResponseEntity<List<FormResponse>> findAllByTipo(@PathVariable String tipoForm) {
        try {
            return ResponseEntity.ok().body(this.service.getAllByTipo(Enum.valueOf(TipoForm.class, tipoForm.toUpperCase())));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping({"/{id}"})
    @Operation(summary = "Get form by ID", description = "Retrieve a form by its ID")
    public ResponseEntity<FormResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok().body(this.service.getById(id));
    }

    @GetMapping({"/visita/{visitaId}"})
    @Operation(summary = "Get forms by Visita ID", description = "Retrieve a list of forms associated with a specific Visita ID")
    public ResponseEntity<List<FormResponse>> findByVisitaId(@PathVariable Long visitaId) {
        var forms = this.service.getByVisitaId(visitaId);
        return ResponseEntity.ok().body(forms);
    }

    @GetMapping({"/visita/{visitaId}/summary/{summaryId}"})
    @Operation(summary = "Get forms by Visita ID and Summary ID", description = "Retrieve a list of forms associated with a specific Visita ID and Summary ID")
    public ResponseEntity<List<FormResponse>> findByVisitaIdAndSummaryId(@PathVariable Long visitaId, @PathVariable Long summaryId) {
        var forms = this.service.getByVisitaIdAndSummaryId(visitaId, summaryId);
        return ResponseEntity.ok().body(forms);
    }

    @PostMapping({"/saveForm"})
    @Operation(summary = "Create a new form", description = "Create a new form with the provided details")
    public ResponseEntity<FormResponse> createForm(@RequestBody @Valid FormRequest formRequest) {
        return ResponseEntity.ok().body(this.service.createForm(formRequest));
    }

    @PutMapping({"/{id}"})
    @Operation(summary = "Update form by ID", description = "Update an existing form by its ID with the provided details")
    public ResponseEntity<FormResponse> updateForm(@PathVariable Long id, @RequestBody @Valid FormRequest formRequest) {
        return ResponseEntity.ok().body(this.service.update(id, formRequest));
    }

    @DeleteMapping({"/{id}"})
    @Operation(summary = "Delete form by ID", description = "Delete an existing form by its ID")
    public ResponseEntity<Void> deleteForm(@PathVariable Long id) {
        this.service.deleteForm(id);
        return ResponseEntity.noContent().build();
    }
}


