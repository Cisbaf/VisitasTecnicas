package com.arquivomidia.service;

import com.arquivomidia.entity.MidiasEntity;
import com.arquivomidia.entity.MidiasRequest;
import com.arquivomidia.entity.MidiasResponse;
import com.arquivomidia.entity.TipoMidia;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Base64;

@Service
@RequiredArgsConstructor
class MidiaMapper {

    private final FileStorageService fileStorageService;

    protected MidiasEntity toEntity(MidiasRequest midia, MultipartFile file) throws IOException {
        String fileName = " ";
        if (midia == null) {
            throw new IllegalArgumentException("MidiaRequest não pode ser nulo");
        }
        if (file != null) {
            fileName = fileStorageService.storeFile(file);
        }

        return MidiasEntity.builder()
                .dataUpload(LocalDate.now())
                .tipoArquivo(TipoMidia.valueOf(midia.tipoArquivo().toUpperCase()))
                .caminhoArquivo(fileName)
                .idVisita(midia.idVisita() != null ? midia.idVisita() : null)
                .flag(midia.flag() != null ? midia.flag() : null)
                .build();
    }

    protected MidiasResponse toResponse(MidiasEntity midia) {
        if (midia == null) return null;

        String base64DataUrl = null;
        if (midia.getCaminhoArquivo() != null) {
            try {
                // Carrega o arquivo do sistema de arquivos
                Path filePath = fileStorageService.getFilePath(midia.getCaminhoArquivo());

                // Verifica se o arquivo existe e é legível
                if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
                    System.err.println("Arquivo não encontrado ou sem permissão de leitura: " + midia.getCaminhoArquivo());
                    return buildResponseWithoutImage(midia);
                }

                byte[] fileContent = Files.readAllBytes(filePath);

                // Verifica se o arquivo não está vazio
                if (fileContent.length == 0) {
                    System.err.println("Arquivo vazio: " + midia.getCaminhoArquivo());
                    return buildResponseWithoutImage(midia);
                }

                // Determina o tipo MIME com base na extensão do arquivo
                String mimeType = determineMimeType(midia.getCaminhoArquivo());

                // Converte para base64
                String base64 = Base64.getEncoder().encodeToString(fileContent);
                base64DataUrl = "data:" + mimeType + ";base64," + base64;
            } catch (Exception e) {
                System.err.println("Erro ao carregar arquivo: " + midia.getCaminhoArquivo());
                e.printStackTrace();
                return buildResponseWithoutImage(midia);
            }
        }

        return MidiasResponse.builder()
                .id(midia.getId())
                .tipoArquivo(midia.getTipoArquivo() != null ? midia.getTipoArquivo().name() : null)
                .base64DataUrl(base64DataUrl)
                .dataUpload(midia.getDataUpload())
                .idVisita(midia.getIdVisita())
                .flag(midia.getFlag() != null ? midia.getFlag() : null)
                .build();
    }

    private MidiasResponse buildResponseWithoutImage(MidiasEntity midia) {
        return MidiasResponse.builder()
                .id(midia.getId())
                .tipoArquivo(midia.getTipoArquivo() != null ? midia.getTipoArquivo().name() : null)
                .base64DataUrl(null)
                .dataUpload(midia.getDataUpload())
                .idVisita(midia.getIdVisita())
                .flag(midia.getFlag() != null ? midia.getFlag() : null)
                .build();
    }

    private String determineMimeType(String fileName) {
        String lowerCaseFileName = fileName.toLowerCase();
        if (lowerCaseFileName.endsWith(".png")) {
            return "image/png";
        } else if (lowerCaseFileName.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerCaseFileName.endsWith(".bmp")) {
            return "image/bmp";
        } else if (lowerCaseFileName.endsWith(".webp")) {
            return "image/webp";
        } else if (lowerCaseFileName.endsWith(".svg")) {
            return "image/svg+xml";
        } else if (lowerCaseFileName.endsWith(".tiff") || lowerCaseFileName.endsWith(".tif")) {
            return "image/tiff";
        }
        // Padrão para JPEG
        return "image/jpeg";
    }
}