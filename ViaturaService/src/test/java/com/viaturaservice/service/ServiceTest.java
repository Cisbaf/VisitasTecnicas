package com.viaturaservice.service;

import com.viaturaservice.entity.Itens;
import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaEntity;
import com.viaturaservice.entity.ViaturaResponse;
import com.viaturaservice.repository.ViaturaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static com.viaturaservice.service.ViaturaMapper.toDTO;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ServiceTest {
    @Mock
    private ViaturaRepository viaturaRepository;

    @Mock
    private ViaturaMapper mapper;

    @InjectMocks
    private ViaturaServiceImp viaturaService;

    private ViaturaRequest viaturaRequest;
    private ViaturaEntity viaturaEntity;
    private ViaturaResponse viaturaResponse;

    @BeforeEach
    void setUp() {
        viaturaRequest = ViaturaRequest.builder()
                .placa("ABC1234")
                .modelo("ModeloX")
                .ano("2020")
                .tipoViatura("TipoA")
                .statusOperacional("Ativa")
                .idBase(1L)
                .itens(List.of(new Itens("Item1", 100)))
                .build();

        viaturaEntity = new ViaturaEntity();
        viaturaEntity.setId(1L);

        viaturaResponse = ViaturaResponse.builder()
                .placa("ABC1234")
                .modelo("ModeloX")
                .ano("2020")
                .tipoViatura("TipoA")
                .statusOperacional("Ativa")
                .idBase(1L)
                .itens(List.of(new Itens("Item1", 100)))
                .build();
    }

    @Test
    void createViatura_Success() {
        when(mapper.toEntity(viaturaRequest)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(viaturaEntity)).thenReturn(viaturaEntity);
        when(toDTO(viaturaEntity)).thenReturn(viaturaResponse);

        ViaturaResponse result = viaturaService.createViatura(viaturaRequest);

        assertEquals(viaturaResponse, result);
        verify(mapper).toEntity(viaturaRequest);
        verify(viaturaRepository).save(viaturaEntity);
        toDTO(viaturaEntity); // Fixed verification
    }

    @Test
    void createViatura_DataIntegrityViolation() {
        when(mapper.toEntity(viaturaRequest)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(viaturaEntity))
                .thenThrow(new DataIntegrityViolationException("chave duplicada"));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> viaturaService.createViatura(viaturaRequest)
        );
        assertTrue(ex.getMessage().contains("Erro ao criar viatura"));
    }

    @Test
    void getViaturaById_Found() {
        when(viaturaRepository.findById(1L)).thenReturn(Optional.of(viaturaEntity));
        when(toDTO(viaturaEntity)).thenReturn(viaturaResponse);

        ViaturaResponse result = viaturaService.getViaturaById(1L);

        assertEquals(viaturaResponse, result);
    }

    @Test
    void getViaturaById_NotFound() {
        when(viaturaRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> viaturaService.getViaturaById(1L)
        );
        assertEquals("Viatura não encontrada.", ex.getMessage());
    }

    @Test
    void getAllViaturas() {
        ViaturaEntity e2 = new ViaturaEntity();
        e2.setId(2L);
        ViaturaResponse dto2 = ViaturaResponse.builder()
                .placa("DEF5G67")
                .modelo("ModeloY")
                .ano("2021")
                .tipoViatura("TipoB")
                .statusOperacional("Inativa")
                .idBase(2L)
                .itens(List.of(new Itens("Item2", 80)))
                .build();

        when(viaturaRepository.findAll()).thenReturn(List.of(viaturaEntity, e2));
        when(toDTO(viaturaEntity)).thenReturn(viaturaResponse);
        when(toDTO(e2)).thenReturn(dto2);

        List<ViaturaResponse> result = viaturaService.getAllViaturas();

        assertEquals(List.of(viaturaResponse, dto2), result);
    }

    @Test
    void getAllViaturas_EmptyList() {
        when(viaturaRepository.findAll()).thenReturn(Collections.emptyList());

        List<ViaturaResponse> result = viaturaService.getAllViaturas();

        assertTrue(result.isEmpty());
    }

    @Test
    void updateViatura_Success() {
        when(mapper.toEntity(viaturaRequest)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(viaturaEntity)).thenReturn(viaturaEntity);
        when(toDTO(viaturaEntity)).thenReturn(viaturaResponse);

        ViaturaResponse result = viaturaService.updateViatura(1L, viaturaRequest);

        assertEquals(viaturaResponse, result);
    }

    @Test
    void deleteViatura_Success() {
        when(viaturaRepository.existsById(1L)).thenReturn(true);

        assertDoesNotThrow(() -> viaturaService.deleteViatura(1L));
        verify(viaturaRepository).deleteById(1L);
    }

    @Test
    void deleteViatura_NotFound() {
        when(viaturaRepository.existsById(1L)).thenReturn(false);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> viaturaService.deleteViatura(1L)
        );
        assertEquals("Viatura não encontrada para exclusão.", ex.getMessage());
    }
}