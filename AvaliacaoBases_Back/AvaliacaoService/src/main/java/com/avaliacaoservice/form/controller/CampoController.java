package com.avaliacaoservice.form.controller;

import com.avaliacaoservice.form.entity.dto.campos.CamposFormRequest;
import com.avaliacaoservice.form.entity.dto.campos.CamposFormResponse;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import com.avaliacaoservice.form.service.capsule.CampoService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/field")
@RequiredArgsConstructor
public class CampoController {

    private final CampoService service;

    @GetMapping({"/{id}"})
    @Operation(summary = "Get field by ID", description = "Retrieve a field by its ID")
    public ResponseEntity<CamposFormResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok().body(this.service.findById(id));
    }

    @GetMapping({"/fields"})
    @Operation(summary = "Get all fields", description = "Retrieve all fields")
    public ResponseEntity<List<CamposFormResponse>> findAll() {
        return ResponseEntity.ok().body(this.service.findAll());
    }

    @PostMapping({"/saveField"})
    @Operation(summary = "Add field to form", description = "Add a new field to an existing form")
    public ResponseEntity<FormResponse> addCampoToForm(@RequestParam Long formId, @RequestBody @Valid CamposFormRequest campo) {
        return ResponseEntity.ok().body(this.service.addCampoToForm(formId, campo));
    }

    @DeleteMapping({"/{id}"})
    @Operation(summary = "Delete field by ID", description = "Delete a field from a form by its ID")
    public ResponseEntity<Void> deleteField(@PathVariable Long id) {
        this.service.deleteCampo(id);
        return ResponseEntity.noContent().build();
    }
}

