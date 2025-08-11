package com.arquivomidia.service;

import com.arquivomidia.entity.MidiasRequest;
import com.arquivomidia.entity.MidiasResponse;
import com.arquivomidia.repository.MidiasRepository;
import com.arquivomidia.service.client.DescriptionClient;
import com.arquivomidia.service.client.VisitaClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.arquivomidia.service.MidiaMapper.toEntity;
import static com.arquivomidia.service.MidiaMapper.toResponse;

@Service
@RequiredArgsConstructor
public class MidiasServiceImp implements MidiaService {
    private final MidiasRepository midiasRepository;
    private final DescriptionClient descriptionClient;
    private final VisitaClient visitaClient;

    public List<MidiasResponse> getMediaByVisitId(Long visitId) {
        if (visitId == null) {
            throw new IllegalArgumentException("Visit ID cannot be null");
        }
        try {
            return midiasRepository.findByIdVisita(visitId).stream().map(MidiaMapper::toResponse).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving media by visit ID: " + visitId, e);
        }
    }

    public List<MidiasResponse> getMediaByNonConformityId(Long nonConformityId) {
        if (nonConformityId == null) {
            throw new IllegalArgumentException("Non-conformity ID cannot be null");
        }
        try {
            return midiasRepository.findByIdInconformidade(nonConformityId).stream().map(MidiaMapper::toResponse).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving media by non-conformity ID: " + nonConformityId, e);
        }
    }

    public MidiasResponse saveMedia(MidiasRequest midia) {
        if (midia == null) {
            throw new IllegalArgumentException("Media request cannot be null");
        }
        try {
            if (midia.idInconformidade() != null && midia.idVisita() != null) {
                throw new IllegalArgumentException("Media cannot have both visit ID and non-conformity ID set");
            } else if (midia.idVisita() != null) {
                visitaClient.existsVisitaById(midia.idVisita());
            } else {
                descriptionClient.existsDescricaoById(midia.idInconformidade());
            }

            var newMidia = midiasRepository.save(toEntity(midia));
            return toResponse(newMidia);
        } catch (Exception e) {
            throw new RuntimeException("Error saving media: " + midia, e);
        }
    }

    public void deleteMedia(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Media ID cannot be null");
        }
        try {
            midiasRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting media with ID: " + id, e);
        }

    }

    public List<MidiasResponse> getAllMedia() {
        if (midiasRepository.findAll().isEmpty()) {
            throw new IllegalArgumentException("No media found");
        }
        return midiasRepository.findAll().stream().map(MidiaMapper::toResponse).collect(Collectors.toList());
    }

    public MidiasResponse getMediaById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Media ID cannot be null");
        }
        try {
            return midiasRepository.findById(id).map(MidiaMapper::toResponse).orElseThrow(() -> new IllegalArgumentException("Media not found with id: " + id));
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving media by ID: " + id, e);
        }
    }

    public boolean mediaExists(Long id) {
        return midiasRepository.existsById(id);
    }

}
