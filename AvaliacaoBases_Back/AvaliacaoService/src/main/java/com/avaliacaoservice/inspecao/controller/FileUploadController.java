package com.avaliacaoservice.inspecao.controller;

import com.avaliacaoservice.inspecao.entity.RelatorioVTR;
import com.avaliacaoservice.inspecao.entity.dto.CidadeProntidaoResponse;
import com.avaliacaoservice.inspecao.entity.dto.CidadeTempoDTO;
import com.avaliacaoservice.inspecao.entity.dto.VtrMediaDto;
import com.avaliacaoservice.inspecao.service.CidadeService;
import com.avaliacaoservice.inspecao.service.CsvProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/inspecao")
@RequiredArgsConstructor
public class FileUploadController {

    private final CsvProcessingService csvProcessingService;
    private final CidadeService cidadeService;

    @PostMapping({"/csv"})
    @Operation(summary = "Upload de arquivo CSV", description = "Faz o upload de um arquivo CSV e XLSX e processa conforme o tipo detectado.")
    public ResponseEntity<String> uploadFile(@RequestParam MultipartFile file, @RequestParam(required = false) LocalDate dataVigencia) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Por favor, selecione um arquivo.");
        }

        if (!Objects.requireNonNull(file.getOriginalFilename()).toLowerCase().endsWith(".csv") && !file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
            return ResponseEntity.badRequest().body("Por favor, envie um arquivo CSV ou XLSX.");
        }

        try {
            if (file.getOriginalFilename().endsWith(".xlsx")) {
                this.csvProcessingService.processarArquivoVTR(file, dataVigencia);

                return ResponseEntity.ok("Relatório VTR processado com sucesso!");
            }

            if (this.csvProcessingService.isArquivoTempos(file)) {
                this.csvProcessingService.processarArquivoTempos(file, dataVigencia);
                return ResponseEntity.ok("Arquivo de tempos processado com sucesso!");
            }
            if (this.csvProcessingService.isArquivoProntidao(file)) {
                this.csvProcessingService.processarArquivoProntidao(file, dataVigencia);
                return ResponseEntity.ok("Arquivo de prontidão processado com sucesso!");
            }
            return ResponseEntity.badRequest().body("Formato de arquivo não reconhecido.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar arquivo: " + e.getMessage());
        }
    }

    @PostMapping({"/csv/tempos"})
    @Operation(summary = "Upload de arquivo CSV de Tempos", description = "Faz o upload de um arquivo CSV específico para tempos.")
    public ResponseEntity<String> uploadCsvTempos(@RequestParam("file") MultipartFile file, @RequestParam(required = false) LocalDate dataVigencia) {
        return processUpload(file, "tempos", dataVigencia);
    }

    @PostMapping({"/csv/prontidao"})
    @Operation(summary = "Upload de arquivo CSV de Prontidão", description = "Faz o upload de um arquivo CSV específico para prontidão.")
    public ResponseEntity<String> uploadCsvProntidao(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) LocalDate dataVigencia) { // <-- Anotação adicionada aqui
        return processUpload(file, "prontidao", dataVigencia);
    }

    @GetMapping({"/tempos"})
    public ResponseEntity<List<CidadeTempoDTO>> getAllCidadesTempo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate mes) {

        // Retorna a lista direto. Se não tiver nada, o Spring retorna [] (array vazio) e status 200.
        return ResponseEntity.ok(this.cidadeService.getAllCidadesTempo(mes));
    }

    @GetMapping({"/prontidao"})
    public ResponseEntity<List<CidadeProntidaoResponse>> getAllCidadesProntidao(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate mes) {

        return ResponseEntity.ok(this.cidadeService.getAllCidadesProntidao(mes));
    }

    @GetMapping({"/prontidao/media"})
    public ResponseEntity<?> getMediaProntidao(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate mes) {

        // Retorna o mapa direto. Se não tiver nada, retorna {} (objeto vazio)
        return ResponseEntity.ok(this.csvProcessingService.calcularMediaProntidao(mes));
    }

    @GetMapping({"/tempos/media"})
    public ResponseEntity<?> getMediaTempos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate mes) {

        return ResponseEntity.ok(this.cidadeService.getCidadesTempoMedia(mes));
    }

    @GetMapping({"/vtr"})
    public ResponseEntity<?> getAllVTR(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate mes) {

        return ResponseEntity.ok(this.cidadeService.getAllVTR(mes));
    }

    @GetMapping({"/vtr/media"})
    public ResponseEntity<?> getVtrMedia(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate mes) {

        return ResponseEntity.ok(this.cidadeService.getVtrMedia(mes));
    }


    private ResponseEntity<String> processUpload(MultipartFile file, String tipo, LocalDate dataVigencia) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Por favor, selecione um arquivo.");
        }

        try {
            return switch (tipo) {
                case "tempos" -> {
                    this.csvProcessingService.processarArquivoTempos(file, dataVigencia);


                    yield ResponseEntity.ok("Arquivo processado com sucesso!");
                }
                case "prontidao" -> {
                    this.csvProcessingService.processarArquivoProntidao(file, dataVigencia);
                    yield ResponseEntity.ok("Arquivo processado com sucesso!");
                }
                default -> ResponseEntity.badRequest().body("Tipo de arquivo não suportado.");
            };
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar arquivo: " + e.getMessage());
        }
    }
}