package com.visitaservice.controller;

import com.visitaservice.entity.VisitaRequest;
import com.visitaservice.entity.VisitaResponse;
import com.visitaservice.service.capsule.VisitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class VisitaController {
    private final VisitaService service;

    @GetMapping("/{id}")
    public ResponseEntity<VisitaResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }
    @GetMapping()
    public ResponseEntity<List<VisitaResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        return ResponseEntity.ok(service.existsVisitaById(id));
    }
    @PostMapping
    public ResponseEntity<VisitaResponse> createVisita(@RequestBody @Valid VisitaRequest request) {
        return ResponseEntity.ok(service.createVisita(request));
    }
    @PutMapping("/{id}")
    public  ResponseEntity<VisitaResponse> updateVisita(@PathVariable Long id, @RequestBody @Valid VisitaRequest request) {
        return ResponseEntity.ok(service.updateVisita(id, request));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
