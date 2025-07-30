package com.viaturaservice.controller;

import com.viaturaservice.entity.ViaturaDTO;
import com.viaturaservice.service.capsule.ViaturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ViaturaController {
    private final ViaturaService viaturaService;

    @GetMapping
    public ResponseEntity<List<ViaturaDTO>> findAll() {
        return ResponseEntity.ok( viaturaService.getAllViaturas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViaturaDTO> findById(@PathVariable Long id) {
        ViaturaDTO viaturaDTO = viaturaService.getViaturaById(id);
        if (viaturaDTO != null) {
            return ResponseEntity.ok(viaturaDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ViaturaDTO> save(@RequestBody ViaturaDTO viaturaDTO) {
        if (viaturaDTO == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(viaturaService.createViatura(viaturaDTO));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteById(Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        viaturaService.deleteViatura(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<ViaturaDTO> update(@PathVariable Long id, @RequestBody ViaturaDTO viaturaDTO) {
        if (id == null || viaturaDTO == null) {
            return ResponseEntity.badRequest().build();
        }
        ViaturaDTO updatedViatura = viaturaService.updateViatura(id, viaturaDTO);
        return ResponseEntity.ok(updatedViatura);
    }

}
