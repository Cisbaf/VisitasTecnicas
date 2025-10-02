package com.arquivomidia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) throws IOException {
        if (uploadDir == null || uploadDir.trim().isEmpty()) {
            uploadDir = "./uploads";
        }

        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.fileStorageLocation);

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

        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Copia o arquivo para o local de destino usando FileOutputStream
        Path targetLocation = this.fileStorageLocation.resolve(fileName);

        try (FileOutputStream fos = new FileOutputStream(targetLocation.toFile())) {
            fos.write(file.getBytes());
        }

        // Verifica se o arquivo foi salvo corretamente
        if (!Files.exists(targetLocation) || Files.size(targetLocation) == 0) {
            throw new IOException("Falha ao salvar o arquivo: " + fileName);
        }

        System.out.println("Arquivo salvo em: " + targetLocation.toString() + " Tamanho: " + Files.size(targetLocation) + " bytes");
        return fileName;
    }

    public Resource loadFileAsResource(String fileName) throws MalformedURLException {
        Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists()) {
            return resource;
        } else {
            throw new RuntimeException("Arquivo não encontrado: " + fileName);
        }
    }

    public void deleteFile(String fileName) throws IOException {
        Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
        Files.deleteIfExists(filePath);
    }

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    // Método para obter o caminho completo do arquivo
    public Path getFilePath(String fileName) {
        return this.fileStorageLocation.resolve(fileName).normalize();
    }
}