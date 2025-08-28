package com.arquivomidia.controller;

import com.arquivomidia.entity.MidiasRequest;
import com.arquivomidia.entity.MidiasResponse;
import com.arquivomidia.service.MidiaService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MidiasController {
    private final MidiaService service;

    @GetMapping
    @Operation(summary = "Get all media files")
    public ResponseEntity<List<MidiasResponse>> getAll() {
        List<MidiasResponse> midias = service.getAllMedia();
        return ResponseEntity.ok(midias);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get media file by ID")
    public ResponseEntity<MidiasResponse> getById(@PathVariable Long id) {
        MidiasResponse midia = service.getMediaById(id);
        if (midia != null) {
            return ResponseEntity.ok(midia);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Save a new media file")
    public ResponseEntity<MidiasResponse> save(@RequestBody MidiasRequest midia) {
       try{
           MidiasResponse savedMidia = service.saveMedia(midia);
           return ResponseEntity.ok(savedMidia);
       }catch (Exception ex) {
           return ResponseEntity.badRequest().body(null);
       }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete media file by ID")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteMedia(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/visita/{visitId}")
    @Operation(summary = "Get media files by visit ID")
    public ResponseEntity<List<MidiasResponse>> getByVisitId(@PathVariable Long visitId) {
        List<MidiasResponse> midias = service.getMediaByVisitId(visitId);
        return ResponseEntity.ok(midias);
    }

    @GetMapping("/inconformidade/{nonConformityId}")
    @Operation(summary = "Get media files by non-conformity ID")
    public ResponseEntity<List<MidiasResponse>> getByNonConformityId(@PathVariable Long nonConformityId) {
        List<MidiasResponse> midias = service.getMediaByNonConformityId(nonConformityId);
        return ResponseEntity.ok(midias);
    }

    @GetMapping("/exists/{id}")
    @Operation(summary = "Check if media file exists by ID")
    public ResponseEntity<Boolean> exists(@PathVariable Long id) {
        boolean exists = service.mediaExists(id);
        return ResponseEntity.ok(exists);
    }

}
