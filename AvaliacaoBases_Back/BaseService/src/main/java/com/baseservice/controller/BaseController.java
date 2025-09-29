package com.baseservice.controller;

import com.baseservice.entity.BaseRequest;
import com.baseservice.entity.BaseResponse;
import com.baseservice.service.capsule.BaseService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BaseController {
    private final BaseService baseService;

    @GetMapping
    @Operation(summary = "Get all Base", description = "Retrieve a list of all base responses.")
    public ResponseEntity<List<BaseResponse>> findAll() {
        return ResponseEntity.ok( baseService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Base by ID", description = "Retrieve a base response by its unique identifier.")
    public ResponseEntity<BaseResponse> findById(@PathVariable Long id) {
        BaseResponse response = baseService.getById(id);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/exists/{id}")
    @Operation(summary = "Check if Base exists by ID", description = "Check if a base response exists by its ID.")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        boolean exists = baseService.existsById(id);
        return ResponseEntity.ok(exists);
    }
    @GetMapping("/name")
    @Operation(summary = "Get Base by Name", description = "Retrieve a base response by its name.")
    public ResponseEntity<BaseResponse> findByName(@RequestParam("name") String name) {
        var response = baseService.getByName(name);
            return ResponseEntity.ok(response);

    }

    @PostMapping
    @Operation(summary = "Create a new Base", description = "Create a new base response with the provided details.")
    public ResponseEntity<BaseResponse> save(@RequestBody @Valid BaseRequest BaseRequest) {
        return ResponseEntity.ok(baseService.createBase(BaseRequest));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Base", description = "Update the details of an existing base response by its ID.")
    public ResponseEntity<BaseResponse> update(@PathVariable Long id, @RequestBody @Valid BaseRequest BaseRequest) {
        BaseResponse response = baseService.update(id, BaseRequest);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Base by ID", description = "Delete a base response by its unique identifier.")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        baseService.deleteBase(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> onRuntime(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ex.getMessage());
    }
}
