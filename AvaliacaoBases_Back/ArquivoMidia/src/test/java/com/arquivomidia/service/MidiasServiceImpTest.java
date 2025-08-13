package com.arquivomidia.service;

import com.arquivomidia.entity.MidiasEntity;
import com.arquivomidia.entity.MidiasRequest;
import com.arquivomidia.entity.MidiasResponse;
import com.arquivomidia.entity.TipoMidia;
import com.arquivomidia.repository.MidiasRepository;
import com.arquivomidia.service.client.DescriptionClient;
import com.arquivomidia.service.client.VisitaClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MidiasServiceImpTest {

    @Mock
    private MidiasRepository midiasRepository;

    @Mock
    private DescriptionClient descriptionClient;

    @Mock
    private VisitaClient visitaClient;

    @InjectMocks
    private MidiasServiceImp midiasService;

    @Test
    void getMediaByVisitId_Success() {
        Long visitId = 1L;
        MidiasEntity entity = createSampleEntity();
        when(midiasRepository.findByIdVisita(visitId)).thenReturn(Collections.singletonList(entity));

        List<MidiasResponse> result = midiasService.getMediaByVisitId(visitId);

        assertEquals(1, result.size());
        assertEquals(entity.getId(), result.getFirst().id());
    }

    @Test
    void getMediaByVisitId_NullId_ThrowsException() {
        assertThrows(IllegalArgumentException.class,
                () -> midiasService.getMediaByVisitId(null));
    }

    @Test
    void getMediaByNonConformityId_Success() {
        Long nonConformityId = 1L;
        MidiasEntity entity = createSampleEntity();
        when(midiasRepository.findByIdInconformidade(nonConformityId))
                .thenReturn(Collections.singletonList(entity));

        List<MidiasResponse> result = midiasService.getMediaByNonConformityId(nonConformityId);

        assertEquals(1, result.size());
        assertEquals(entity.getId(), result.getFirst().id());
    }

    @Test
    void saveMedia_WithVisita_Success() {
        MidiasRequest request = new MidiasRequest("FOTO", "http://example.com", 1L, null);
        MidiasEntity savedEntity = createSampleEntity();

        when(visitaClient.existsVisitaById(1L)).thenReturn(true);
        when(midiasRepository.save(any())).thenReturn(savedEntity);

        MidiasResponse response = midiasService.saveMedia(request);

        assertNotNull(response);
        assertEquals(savedEntity.getId(), response.id());
        assertEquals("FOTO", response.tipoArquivo());
    }

    @Test
    void saveMedia_WithInconformidade_Success() {
        MidiasRequest request = new MidiasRequest("VIDEO", "http://example.com", null, 2L);

        MidiasEntity savedEntity = MidiasEntity.builder()
                .id(1L)
                .tipoArquivo(TipoMidia.VIDEO)
                .url("http://example.com")
                .dataUpload(LocalDate.now())
                .idVisita(null)
                .idInconformidade(2L)
                .build();

        when(descriptionClient.existsDescricaoById(2L)).thenReturn(true);
        when(midiasRepository.save(any())).thenReturn(savedEntity);

        MidiasResponse response = midiasService.saveMedia(request);

        assertNotNull(response);
        assertEquals(savedEntity.getId(), response.id());
        assertEquals("VIDEO", response.tipoArquivo());
    }

    @Test
    void saveMedia_BothIdsSet_ThrowsException() {
        MidiasRequest request = new MidiasRequest("FOTO", "http://example.com", 1L, 2L);
        assertThrows(RuntimeException.class,
                () -> midiasService.saveMedia(request));
    }

    @Test
    void deleteMedia_Success() {
        Long id = 1L;
        doNothing().when(midiasRepository).deleteById(id);

        assertDoesNotThrow(() -> midiasService.deleteMedia(id));
        verify(midiasRepository).deleteById(id);
    }

    @Test
    void getAllMedia_Success() {
        MidiasEntity entity = createSampleEntity();
        when(midiasRepository.findAll()).thenReturn(Collections.singletonList(entity));

        List<MidiasResponse> result = midiasService.getAllMedia();

        assertEquals(1, result.size());
        assertEquals(entity.getId(), result.getFirst().id());
    }

    @Test
    void getMediaById_Success() {
        Long id = 1L;
        MidiasEntity entity = createSampleEntity();
        when(midiasRepository.findById(id)).thenReturn(Optional.of(entity));

        MidiasResponse response = midiasService.getMediaById(id);

        assertNotNull(response);
        assertEquals(id, response.id());
    }

    @Test
    void mediaExists_ReturnsTrue() {
        Long id = 1L;
        when(midiasRepository.existsById(id)).thenReturn(true);
        assertTrue(midiasService.mediaExists(id));
    }

    private MidiasEntity createSampleEntity() {
        return MidiasEntity.builder()
                .id(1L)
                .tipoArquivo(TipoMidia.FOTO)
                .url("http://example.com")
                .dataUpload(LocalDate.now())
                .idVisita(1L)
                .idInconformidade(null)
                .build();
    }
}