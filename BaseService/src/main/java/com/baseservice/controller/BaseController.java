package com.baseservice.controller;

import com.baseservice.entity.BaseRequest;
import com.baseservice.entity.BaseResponse;
import com.baseservice.service.capsule.BaseService;
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
    public ResponseEntity<List<BaseResponse>> findAll() {
        return ResponseEntity.ok( baseService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse> findById(@PathVariable Long id) {
        BaseResponse response = baseService.getById(id);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        boolean exists = baseService.existsById(id);
        return ResponseEntity.ok(exists);
    }

    @PostMapping
    public ResponseEntity<BaseResponse> save(@RequestBody BaseRequest BaseRequest) {
        return ResponseEntity.ok(baseService.createBase(BaseRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse> update(@PathVariable Long id, @RequestBody BaseRequest BaseRequest) {
        BaseResponse response = baseService.update(id, BaseRequest);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
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
