package com.avaliacaoservice.arquivos.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileAttribute;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) throws IOException {
        if (uploadDir == null || uploadDir.trim().isEmpty()) {
            uploadDir = "./uploads";
        }

        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.fileStorageLocation, (FileAttribute<?>[]) new FileAttribute[0]);

        System.out.println("Diretório de upload configurado: " + this.fileStorageLocation);
    }


    public String storeFile(MultipartFile file) throws IOException {
        // Verifica se o arquivo é uma imagem
        if (!isImageFile(file)) {
            throw new IOException("O arquivo não é uma imagem válida");
        }

        // Gera um nome único para o arquivo mantendo a extensão original
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";

        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID() + fileExtension;

        // Copia o arquivo para o local de destino usando FileOutputStream
        Path targetLocation = this.fileStorageLocation.resolve(fileName);

        try (FileOutputStream fos = new FileOutputStream(targetLocation.toFile())) {
            fos.write(file.getBytes());
        }

        // Verifica se o arquivo foi salvo corretamente
        if (!Files.exists(targetLocation) || Files.size(targetLocation) == 0) {
            throw new IOException("Falha ao salvar o arquivo: " + fileName);
        }

        System.out.println("Arquivo salvo em: " + targetLocation + " Tamanho: " + Files.size(targetLocation) + " bytes");
        return fileName;
    }

    public void deleteFile(String fileName) throws IOException {
        Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
        Files.deleteIfExists(filePath);
    }

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return (contentType != null && contentType.startsWith("image/"));
    }


    public Path getFilePath(String fileName) {
        return this.fileStorageLocation.resolve(fileName).normalize();
    }
}