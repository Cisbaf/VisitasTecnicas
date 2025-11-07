package com.avaliacaoservice.arquivos.controller;

import com.avaliacaoservice.arquivos.entity.MidiasRequest;
import com.avaliacaoservice.arquivos.entity.MidiasResponse;
import com.avaliacaoservice.arquivos.service.MidiaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/midias")
@AllArgsConstructor
public class MidiasController {

    private final MidiaService service;

    @GetMapping
    @Operation(summary = "Get all media files")
    public ResponseEntity<List<MidiasResponse>> getAll() {
        List<MidiasResponse> midias = this.service.getAllMedia();
        return ResponseEntity.ok(midias);
    }

    @GetMapping({"/{id}"})
    @Operation(summary = "Get media file by ID")
    public ResponseEntity<MidiasResponse> getById(@PathVariable Long id) {
        MidiasResponse midia = this.service.getMediaById(id);
        if (midia != null) {
            return ResponseEntity.ok(midia);
        }
        return ResponseEntity.notFound().build();
    }


    @PostMapping(consumes = {"multipart/form-data"})
    @Operation(summary = "Save a new media file")
    public ResponseEntity<MidiasResponse> save(@RequestPart("midia") @Valid MidiasRequest midia, @RequestPart("file") MultipartFile file) {

        return ResponseEntity.ok(this.service.saveMedia(midia, file));
    }

    @PutMapping({"/{id}"})
    @Operation(summary = "Update media file flag by ID")
    public ResponseEntity<MidiasResponse> updateFlag(@PathVariable Long id, @RequestBody MidiasRequest request) throws IOException {

        System.out.println("Atualizando mídia com ID: " + id + " com dados: " + request);

        MidiasResponse updatedMidia = this.service.updateMidia(id, request);

        return ResponseEntity.ok(updatedMidia);
    }

    @DeleteMapping({"/{id}"})
    @Operation(summary = "Delete media file by ID")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        this.service.deleteMedia(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping({"/visita/{visitId}"})
    @Operation(summary = "Get media files by visit ID")
    public ResponseEntity<List<MidiasResponse>> getByVisitId(@PathVariable Long visitId) {

        List<MidiasResponse> midias = this.service.getMediaByVisitId(visitId);

        return ResponseEntity.ok(midias);
    }


    @GetMapping({"/exists/{id}"})
    @Operation(summary = "Check if media file exists by ID")
    public ResponseEntity<Boolean> exists(@PathVariable Long id) {

        boolean exists = this.service.mediaExists(id);

        return ResponseEntity.ok(exists);
    }
}
