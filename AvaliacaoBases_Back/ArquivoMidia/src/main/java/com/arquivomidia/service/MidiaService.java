package com.arquivomidia.service;

import com.arquivomidia.entity.MidiasRequest;
import com.arquivomidia.entity.MidiasResponse;

import java.util.List;


public interface MidiaService {
    List<MidiasResponse> getMediaByVisitId(Long visitId);

    List<MidiasResponse> getMediaByNonConformityId(Long nonConformityId);

    MidiasResponse saveMedia(MidiasRequest midia);

    void deleteMedia(Long id);

    List<MidiasResponse> getAllMedia();

    MidiasResponse getMediaById(Long id);

    boolean mediaExists(Long id);
}
