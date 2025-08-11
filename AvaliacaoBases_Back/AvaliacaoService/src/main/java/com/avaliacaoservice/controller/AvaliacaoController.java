package com.avaliacaoservice.controller;

import com.avaliacaoservice.entity.AvaliacaoEntity;
import com.avaliacaoservice.service.AvaliacaoService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AvaliacaoController {
    public final AvaliacaoService avaliacaoService;

    @GetMapping("/{id}")
    @Operation(summary = "Get Avaliacao by ID", description = "Retrieve an avaliacao by its unique identifier.")
    public ResponseEntity<AvaliacaoEntity> findById(@PathVariable Long id) {
        AvaliacaoEntity avaliacao = avaliacaoService.findById(id);
        if (avaliacao != null) {
            return ResponseEntity.ok(avaliacao);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    @Operation(summary = "Get All Avaliacoes", description = "Retrieve a list of all avaliacoes.")
    public ResponseEntity<List<AvaliacaoEntity>> findAll() {
        List<AvaliacaoEntity> avaliacoes = avaliacaoService.findAll();
        if (avaliacoes != null && !avaliacoes.isEmpty()) {
            return ResponseEntity.ok(avaliacoes);
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/visita/{idVisita}")
    @Operation(summary = "Get Avaliacao by Visita ID", description = "Retrieve an avaliacao by its associated visita ID.")
    public ResponseEntity<List<AvaliacaoEntity>> findByIdVisita(@PathVariable Long idVisita) {
        var avaliacao = avaliacaoService.findByIdVisita(idVisita);
        if (avaliacao != null) {
            return ResponseEntity.ok(avaliacao);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Create Avaliacao", description = "Create a new avaliacao with the provided details.")
    public ResponseEntity<AvaliacaoEntity> createAvaliacao(@RequestBody AvaliacaoEntity avaliacao) {
        if (avaliacao == null) {
            return ResponseEntity.badRequest().build();
        }
        AvaliacaoEntity createdAvaliacao = avaliacaoService.createAvaliacao(avaliacao);
        return ResponseEntity.ok(createdAvaliacao);
    }
    @PostMapping("/saveAll")
    @Operation(summary = "Create Multiple Avaliacoes", description = "Create multiple avaliacoes with the provided list.")
    public ResponseEntity<List<AvaliacaoEntity>> createAll(@RequestBody List<AvaliacaoEntity> avaliacoes) {
        if (avaliacoes == null || avaliacoes.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<AvaliacaoEntity> createdAvaliacoes = avaliacaoService.createAll(avaliacoes);
        return ResponseEntity.ok(createdAvaliacoes);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Avaliacao by ID", description = "Update an avaliacao by its unique identifier.")
    public ResponseEntity<AvaliacaoEntity> updateAvaliacao(@PathVariable Long id, @RequestBody AvaliacaoEntity avaliacao) {
        if (id == null || avaliacao == null) {
            return ResponseEntity.badRequest().build();
        }
        AvaliacaoEntity updatedAvaliacao = avaliacaoService.updateAvaliacao(id, avaliacao);
        if (updatedAvaliacao != null) {
            return ResponseEntity.ok(updatedAvaliacao);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Avaliacao by ID", description = "Delete an avaliacao by its unique identifier.")
    public ResponseEntity<Void> deleteAvaliacao(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        avaliacaoService.deleteAvaliacao(id);
        return ResponseEntity.noContent().build();
    }
}
