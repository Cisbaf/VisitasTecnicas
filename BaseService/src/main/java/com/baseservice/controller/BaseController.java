package com.baseservice.controller;

import com.baseservice.entity.BaseDTO;
import com.baseservice.service.capsule.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BaseController {
    private final BaseService baseService;

    @GetMapping
    public ResponseEntity<List<BaseDTO>> findAll() {
        return ResponseEntity.ok( baseService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseDTO> findById(@PathVariable Long id) {
        BaseDTO BaseDTO = baseService.getById(id);
        if (BaseDTO != null) {
            return ResponseEntity.ok(BaseDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<BaseDTO> save(@RequestBody BaseDTO BaseDTO) {
        return ResponseEntity.ok(baseService.createBase(BaseDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseDTO> update(@PathVariable Long id, @RequestBody BaseDTO BaseDTO) {
        BaseDTO updatedBase = baseService.update(id, BaseDTO);
        if (updatedBase != null) {
            return ResponseEntity.ok(updatedBase);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        baseService.deleteBase(id);
        return ResponseEntity.noContent().build();
    }
}
