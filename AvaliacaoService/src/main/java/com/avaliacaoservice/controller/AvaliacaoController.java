package com.avaliacaoservice.controller;

import com.avaliacaoservice.entity.AvaliacaoEntity;
import com.avaliacaoservice.service.AvaliacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AvaliacaoController {
    public final AvaliacaoService avaliacaoService;

    @GetMapping("/{id}")
    public ResponseEntity<AvaliacaoEntity> findById(@PathVariable Long id) {
        AvaliacaoEntity avaliacao = avaliacaoService.findById(id);
        if (avaliacao != null) {
            return ResponseEntity.ok(avaliacao);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping
    public ResponseEntity<List<AvaliacaoEntity>> findAll() {
        List<AvaliacaoEntity> avaliacoes = avaliacaoService.findAll();
        if (avaliacoes != null && !avaliacoes.isEmpty()) {
            return ResponseEntity.ok(avaliacoes);
        } else {
            return ResponseEntity.noContent().build();
        }
    }
    @PostMapping
    public ResponseEntity<AvaliacaoEntity> createAvaliacao(@RequestBody AvaliacaoEntity avaliacao) {
        if (avaliacao == null) {
            return ResponseEntity.badRequest().build();
        }
        AvaliacaoEntity createdAvaliacao = avaliacaoService.createAvaliacao(avaliacao);
        return ResponseEntity.ok(createdAvaliacao);
    }
    @PutMapping("/{id}")
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
    public ResponseEntity<Void> deleteAvaliacao(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        avaliacaoService.deleteAvaliacao(id);
        return ResponseEntity.noContent().build();
    }
}
