package com.avaliacaoservice.arquivos.service;

import com.avaliacaoservice.arquivos.entity.MidiasEntity;
import com.avaliacaoservice.arquivos.entity.MidiasRequest;
import com.avaliacaoservice.arquivos.entity.MidiasResponse;
import com.avaliacaoservice.arquivos.repository.MidiasRepository;
import com.avaliacaoservice.visita.service.capsule.VisitaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class MidiasServiceImp implements MidiaService {
    private final MidiasRepository midiasRepository;
    private final FileStorageService fileStorageService;
    private final VisitaService visitaClient;
    private final MidiaMapper midiaMapper;



    public List<MidiasResponse> getMediaByVisitId(Long visitId) {
        if (visitId == null) {
            throw new IllegalArgumentException("Visit ID cannot be null");
        }
        try {
            Objects.requireNonNull(this.midiaMapper);
            return this.midiasRepository.findByIdVisita(visitId).stream().map(this.midiaMapper::toResponse).collect(Collectors.toList());
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

                this.visitaClient.existsVisitaById(idVisita);
            }


            if (idVisita == null) {

                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Midia e arquivo devem ser informados");
            }


            MidiasEntity newMidia = this.midiasRepository.save(this.midiaMapper.toEntity(midia, file));

            return this.midiaMapper.toResponse(newMidia);

        } catch (Exception e) {

            log.error("Erro ao salvar midia: {}. causa: {}", midia, e, e);

            Throwable root = e;

            while (root.getCause() != null) root = root.getCause();

            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao salvar mídia: " + root
                    .getClass().getSimpleName() + ": " + root.getMessage(), e);
        }
    }

    public void deleteMedia(Long id) {

        if (id == null) {

            throw new IllegalArgumentException("Media ID cannot be null");
        }

        try {

            MidiasEntity midia = this.midiasRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Media not found with id: " + id));



            if (midia.getCaminhoArquivo() != null) {

                this.fileStorageService.deleteFile(midia.getCaminhoArquivo());
            }


            this.midiasRepository.deleteById(id);

        } catch (Exception e) {

            throw new RuntimeException("Error deleting media with ID: " + id, e);
        }
    }


    public List<MidiasResponse> getAllMedia() {

        if (this.midiasRepository.findAll().isEmpty()) {

            throw new IllegalArgumentException("No media found");
        }

        Objects.requireNonNull(this.midiaMapper);
        return this.midiasRepository.findAll().stream().map(this.midiaMapper::toResponse).collect(Collectors.toList());
    }

    public MidiasResponse getMediaById(Long id) {

        if (id == null) {

            throw new IllegalArgumentException("Media ID cannot be null");
        }
        try {

            Objects.requireNonNull(this.midiaMapper);
            return this.midiasRepository.findById(id).map(this.midiaMapper::toResponse).orElseThrow(() -> new IllegalArgumentException("Media not found with id: " + id));

        } catch (Exception e) {

            throw new RuntimeException("Error retrieving media by ID: " + id, e);
        }
    }

    public MidiasResponse updateMidia(Long midiaId, MidiasRequest midia) throws IOException {

        MidiasEntity oldMidia = this.midiasRepository.findById(midiaId).orElseThrow(() -> new IllegalArgumentException("Media not found with id: " + midiaId));

        MidiasEntity updatedMidia = this.midiaMapper.toEntity(midia, null);


        BeanUtils.copyProperties(updatedMidia, oldMidia, "id", "dataUpload", "caminhoArquivo");


        MidiasEntity savedMidia = this.midiasRepository.save(oldMidia);

        return this.midiaMapper.toResponse(savedMidia);
    }

    public boolean mediaExists(Long id) {

        return this.midiasRepository.existsById(id);
    }
}
