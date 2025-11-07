package com.avaliacaoservice.inspecao.controller;

import com.avaliacaoservice.inspecao.entity.RelatorioVTR;
import com.avaliacaoservice.inspecao.entity.dto.CidadeProntidaoResponse;
import com.avaliacaoservice.inspecao.entity.dto.CidadeTempoDTO;
import com.avaliacaoservice.inspecao.entity.dto.VtrMediaDto;
import com.avaliacaoservice.inspecao.service.CidadeService;
import com.avaliacaoservice.inspecao.service.CsvProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<String> uploadFile(@RequestParam MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Por favor, selecione um arquivo.");
        }

        if (!Objects.requireNonNull(file.getOriginalFilename()).toLowerCase().endsWith(".csv") && !file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
            return ResponseEntity.badRequest().body("Por favor, envie um arquivo CSV ou XLSX.");
        }

        try {
            if (file.getOriginalFilename().endsWith(".xlsx")) {
                this.csvProcessingService.processarArquivoVTR(file);

                return ResponseEntity.ok("Relatório VTR processado com sucesso!");
            }

            if (this.csvProcessingService.isArquivoTempos(file)) {
                this.csvProcessingService.processarArquivoTempos(file);
                return ResponseEntity.ok("Arquivo de tempos processado com sucesso!");
            }
            if (this.csvProcessingService.isArquivoProntidao(file)) {
                this.csvProcessingService.processarArquivoProntidao(file);
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
    public ResponseEntity<String> uploadCsvTempos(@RequestParam("file") MultipartFile file) {
        return processUpload(file, "tempos");
    }

    @PostMapping({"/csv/prontidao"})
    @Operation(summary = "Upload de arquivo CSV de Prontidão", description = "Faz o upload de um arquivo CSV específico para prontidão.")
    public ResponseEntity<String> uploadCsvProntidao(@RequestParam("file") MultipartFile file) {
        return processUpload(file, "prontidao");
    }

    @GetMapping({"/tempos"})
    public ResponseEntity<List<CidadeTempoDTO>> getAllCidadesTempo() {
        List<CidadeTempoDTO> cidadesTempo = this.cidadeService.getAllCidadesTempo();
        if (cidadesTempo.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(cidadesTempo);
    }


    @GetMapping({"/prontidao"})
    public ResponseEntity<List<CidadeProntidaoResponse>> getAllCidadesProntidao() {
        List<CidadeProntidaoResponse> cidadesProntidao = this.cidadeService.getAllCidadesProntidao();
        if (cidadesProntidao.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(cidadesProntidao);
    }


    @GetMapping({"/prontidao/media"})
    public ResponseEntity<?> getMediaProntidao() {
        HashMap<String, String> mapaProntidao = this.csvProcessingService.calcularMediaProntidao();
        if (mapaProntidao.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(mapaProntidao);
    }

    @GetMapping({"/tempos/media"})
    public ResponseEntity<?> getMediaTempos() {
        HashMap<String, String> mapaTempos = this.cidadeService.getCidadesTempoMedia();
        if (mapaTempos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(mapaTempos);
    }


    @GetMapping({"/vtr"})
    public ResponseEntity<?> getAllVTR() {
        List<RelatorioVTR> listaVtr = this.cidadeService.getAllVTR();
        if (listaVtr.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(listaVtr);
    }

    @GetMapping({"/vtr/media"})
    public ResponseEntity<?> getVtrMedia() {
        List<VtrMediaDto> listaVtr = this.cidadeService.getVtrMedia();
        if (listaVtr.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(listaVtr);
    }


    private ResponseEntity<String> processUpload(MultipartFile file, String tipo) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Por favor, selecione um arquivo.");
        }

        try {
            return switch (tipo) {
                case "tempos" -> {
                    this.csvProcessingService.processarArquivoTempos(file);


                    yield ResponseEntity.ok("Arquivo processado com sucesso!");
                }
                case "prontidao" -> {
                    this.csvProcessingService.processarArquivoProntidao(file);
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