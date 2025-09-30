package com.inspecaoservice.controller;

import com.inspecaoservice.service.CsvProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@AllArgsConstructor
public class FileUploadController {

    private CsvProcessingService csvProcessingService;

    @PostMapping("/csv")
    @Operation(summary = "Upload de arquivo CSV", description = "Faz o upload de um arquivo CSV e processa conforme o tipo detectado.")
    public ResponseEntity<String> uploadCsvFile(@RequestParam MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Por favor, selecione um arquivo.");
        }

        if (!file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
            return ResponseEntity.badRequest().body("Por favor, envie um arquivo CSV.");
        }

        try {
            // Detecta automaticamente o tipo de arquivo
            if (csvProcessingService.isArquivoTempos(file)) {
                csvProcessingService.processarArquivoTempos(file);
                return ResponseEntity.ok("Arquivo de tempos processado com sucesso!");
            } else if (csvProcessingService.isArquivoProntidao(file)) {
                csvProcessingService.processarArquivoProntidao(file);
                return ResponseEntity.ok("Arquivo de prontidão processado com sucesso!");
            } else {
                return ResponseEntity.badRequest().body("Formato de arquivo não reconhecido.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar arquivo: " + e.getMessage());
        }
    }

    @PostMapping("/csv/tempos")
    @Operation(summary = "Upload de arquivo CSV de Tempos", description = "Faz o upload de um arquivo CSV específico para tempos.")
    public ResponseEntity<String> uploadCsvTempos(@RequestParam("file") MultipartFile file) {
        return processUpload(file, "tempos");
    }

    @PostMapping("/csv/prontidao")
    @Operation(summary = "Upload de arquivo CSV de Prontidão", description = "Faz o upload de um arquivo CSV específico para prontidão.")
    public ResponseEntity<String> uploadCsvProntidao(@RequestParam("file") MultipartFile file) {
        return processUpload(file, "prontidao");
    }

    private ResponseEntity<String> processUpload(MultipartFile file, String tipo) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Por favor, selecione um arquivo.");
        }

        try {
            switch (tipo) {
                case "tempos":
                    csvProcessingService.processarArquivoTempos(file);
                    break;
                case "prontidao":
                    csvProcessingService.processarArquivoProntidao(file);
                    break;
                default:
                    return ResponseEntity.badRequest().body("Tipo de arquivo não suportado.");
            }

            return ResponseEntity.ok("Arquivo processado com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar arquivo: " + e.getMessage());
        }
    }
}