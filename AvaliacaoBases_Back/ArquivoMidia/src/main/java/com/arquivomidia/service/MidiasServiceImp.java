package com.arquivomidia.service;

import com.arquivomidia.entity.MidiasEntity;
import com.arquivomidia.entity.MidiasRequest;
import com.arquivomidia.entity.MidiasResponse;
import com.arquivomidia.repository.MidiasRepository;
import com.arquivomidia.service.client.VisitaClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MidiasServiceImp implements MidiaService {
    private final MidiasRepository midiasRepository;
    private final VisitaClient visitaClient;
    private final FileStorageService fileStorageService;
    private final MidiaMapper midiaMapper;

    public List<MidiasResponse> getMediaByVisitId(Long visitId) {
        if (visitId == null) {
            throw new IllegalArgumentException("Visit ID cannot be null");
        }
        try {
            return midiasRepository.findByIdVisita(visitId).stream().map(midiaMapper::toResponse).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving media by visit ID: " + visitId, e);
        }
    }

    public MidiasResponse saveMedia(MidiasRequest midia, MultipartFile file) {
        if (midia == null || file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Media request cannot be null and file must be provided" + midia);
        }
        try {
            Long idVisita = midia.idVisita();

            if (idVisita != null) {
                visitaClient.existsVisitaById(idVisita);
            }

            if (idVisita == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Midia e arquivo devem ser informados");
            }

            var newMidia = midiasRepository.save(midiaMapper.toEntity(midia, file));
            return midiaMapper.toResponse(newMidia);
        } catch (Exception e) {
            log.error("Erro ao salvar midia: {}. causa: {}", midia, e, e);
            Throwable root = e;
            while (root.getCause() != null) root = root.getCause();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erro ao salvar mídia: " + root.getClass().getSimpleName() + ": " + root.getMessage(), e);
        }
    }

    public void deleteMedia(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Media ID cannot be null");
        }
        try {
            MidiasEntity midia = midiasRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Media not found with id: " + id));

            // Remove o arquivo do sistema de arquivos
            if (midia.getCaminhoArquivo() != null) {
                fileStorageService.deleteFile(midia.getCaminhoArquivo());
            }

            // Remove do banco de dados
            midiasRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting media with ID: " + id, e);
        }
    }


    public List<MidiasResponse> getAllMedia() {
        if (midiasRepository.findAll().isEmpty()) {
            throw new IllegalArgumentException("No media found");
        }
        return midiasRepository.findAll().stream().map(midiaMapper::toResponse).collect(Collectors.toList());
    }

    public MidiasResponse getMediaById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Media ID cannot be null");
        }
        try {
            return midiasRepository.findById(id).map(midiaMapper::toResponse).orElseThrow(() -> new IllegalArgumentException("Media not found with id: " + id));
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving media by ID: " + id, e);
        }
    }

    public MidiasResponse updateMidia(Long midiaId, MidiasRequest midia) throws IOException {
        var oldMidia = midiasRepository.findById(midiaId).orElseThrow(() -> new IllegalArgumentException("Media not found with id: " + midiaId));
        var updatedMidia = midiaMapper.toEntity(midia, null);

        BeanUtils.copyProperties(updatedMidia, oldMidia, "id", "dataUpload", "caminhoArquivo");

        var savedMidia = midiasRepository.save(oldMidia);
        return midiaMapper.toResponse(savedMidia);
    }

    public boolean mediaExists(Long id) {
        return midiasRepository.existsById(id);
    }

}
