package com.arquivomidia.service;

import com.arquivomidia.entity.MidiasRequest;
import com.arquivomidia.entity.MidiasResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


public interface MidiaService {
    List<MidiasResponse> getMediaByVisitId(Long visitId);

    MidiasResponse saveMedia(MidiasRequest midia, MultipartFile file);

    void deleteMedia(Long id);

    List<MidiasResponse> getAllMedia();

    MidiasResponse getMediaById(Long id);
    MidiasResponse updateMidia(Long midiaId, MidiasRequest midia) throws IOException;
    boolean mediaExists(Long id);
}
