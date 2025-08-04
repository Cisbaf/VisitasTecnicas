package com.viaturaservice.controller;

import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaResponse;
import com.viaturaservice.service.IdBaseExists;
import com.viaturaservice.service.capsule.ViaturaService;
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


    @GetMapping
    public ResponseEntity<List<ViaturaResponse>> findAll() {
        return ResponseEntity.ok(viaturaService.getAllViaturas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViaturaResponse> findById(@PathVariable Long id) {
        var viaturaRequest = viaturaService.getViaturaById(id);
        if (viaturaRequest != null) {
            return ResponseEntity.ok(viaturaRequest);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        boolean exists = viaturaService.existsViaturaById(id);
        return ResponseEntity.ok(exists);
    }


    @PostMapping
    public ResponseEntity<ViaturaResponse> save(@RequestBody @Valid ViaturaRequest viaturaRequest) {
        if (viaturaRequest == null || !exists.existsById(viaturaRequest.idBase())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(viaturaService.createViatura(viaturaRequest));
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
    public ResponseEntity<ViaturaResponse> update(@PathVariable Long id, @RequestBody @Valid ViaturaRequest viaturaRequest) {
        if (id == null || viaturaRequest == null) {
            return ResponseEntity.badRequest().build();
        }
        ViaturaResponse updatedViatura = viaturaService.updateViatura(id, viaturaRequest);
        return ResponseEntity.ok(updatedViatura);
    }

}
