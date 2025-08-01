package com.checklistitemservice.controller;

import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
import com.checklistitemservice.service.capsule.CheckListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CheckListController {
    private final CheckListService service;

    @GetMapping
    public ResponseEntity<List<CheckListResponse>> findAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CheckListResponse> findById(@PathVariable Long id) {
        CheckListResponse checkListResponse = service.getById(id);
        if (checkListResponse != null) {
            return ResponseEntity.ok(checkListResponse);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/save")
    public ResponseEntity<CheckListResponse> save(@RequestBody @Valid CheckListRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.createCheckList(request));
    }

    @PostMapping("/saveAll")
    public ResponseEntity<List<CheckListResponse>> saveAll(@RequestBody @Valid List<CheckListRequest> requests) {
        if (requests == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.createCheckLists(requests));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        service.deleteCheckList(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<CheckListResponse> update(@PathVariable Long id, @RequestBody @Valid CheckListRequest request) {
        if (id == null || request == null) {
            return ResponseEntity.badRequest().build();
        }
        CheckListResponse updatedCheckList = service.update(id, request);
        return ResponseEntity.ok(updatedCheckList);
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        return ResponseEntity.ok(service.existsById(id));
    }
}
