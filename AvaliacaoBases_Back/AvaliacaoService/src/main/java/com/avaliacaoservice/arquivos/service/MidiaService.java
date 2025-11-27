package com.avaliacaoservice.arquivos.service;

import com.avaliacaoservice.arquivos.entity.MidiasRequest;
import com.avaliacaoservice.arquivos.entity.MidiasResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface MidiaService {
    List<MidiasResponse> getMediaByVisitId(Long paramLong);

    MidiasResponse saveMedia(MidiasRequest paramMidiasRequest, MultipartFile paramMultipartFile);

    void deleteMedia(Long paramLong);

    List<MidiasResponse> getAllMedia();

    MidiasResponse getMediaById(Long paramLong);

    MidiasResponse updateMidia(Long paramLong, MidiasRequest paramMidiasRequest) throws IOException;

    boolean mediaExists(Long paramLong);
}