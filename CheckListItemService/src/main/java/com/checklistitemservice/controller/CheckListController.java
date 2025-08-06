package com.checklistitemservice.controller;

import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
import com.checklistitemservice.service.capsule.CheckListService;
import io.swagger.v3.oas.annotations.Operation;
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
    @Operation(summary = "Get all CheckLists", description = "Retrieve a list of all checklists.")
    public ResponseEntity<List<CheckListResponse>> findAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get CheckList by ID", description = "Retrieve a checklist by its unique identifier.")
    public ResponseEntity<CheckListResponse> findById(@PathVariable Long id) {
        CheckListResponse checkListResponse = service.getById(id);
        if (checkListResponse != null) {
            return ResponseEntity.ok(checkListResponse);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/visita/{visitaId}")
    @Operation(summary = "Get CheckLists by Visita ID", description = "Retrieve a list of checklists associated with a specific visita ID.")
    public ResponseEntity<List<CheckListResponse>> findByVisitaId(@PathVariable Long visitaId) {
        List<CheckListResponse> checkLists = service.getByVisitaId(visitaId);
        if (checkLists != null && !checkLists.isEmpty()) {
            return ResponseEntity.ok(checkLists);
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping("/save")
    @Operation(summary = "Create a new CheckList", description = "Create a new checklist with the provided details.")
    public ResponseEntity<CheckListResponse> save(@RequestBody @Valid CheckListRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.createCheckList(request));
    }

    @PostMapping("/saveAll")
    @Operation(summary = "Create multiple CheckLists", description = "Create multiple checklists with the provided details.")
    public ResponseEntity<List<CheckListResponse>> saveAll(@RequestBody @Valid List<CheckListRequest> requests) {
        if (requests == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.createCheckLists(requests));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete CheckList by ID", description = "Delete a checklist by its unique identifier.")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        service.deleteCheckList(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update CheckList by ID", description = "Update the details of an existing checklist by its ID.")
    public ResponseEntity<CheckListResponse> update(@PathVariable Long id, @RequestBody @Valid CheckListRequest request) {
        if (id == null || request == null) {
            return ResponseEntity.badRequest().build();
        }
        CheckListResponse updatedCheckList = service.update(id, request);
        return ResponseEntity.ok(updatedCheckList);
    }

    @GetMapping("/exists/{id}")
    @Operation(summary = "Check if CheckList exists by ID", description = "Check if a checklist exists by its unique identifier.")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        return ResponseEntity.ok(service.existsById(id));
    }

    @GetMapping("/descexists/{descriptionId}")
    @Operation(summary = "Check if description exists by ID", description = "Check if a description exists by its unique identifier.")
    public ResponseEntity<Boolean> descriptionExist(@PathVariable Long descriptionId) {
        return ResponseEntity.ok(service.descriptionExist(descriptionId));
    }
}
