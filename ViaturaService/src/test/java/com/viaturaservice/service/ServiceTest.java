package com.viaturaservice.service;

import com.viaturaservice.entity.Itens;
import com.viaturaservice.entity.ViaturaDTO;
import com.viaturaservice.entity.ViaturaEntity;
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

    private ViaturaDTO viaturaDTO;
    private ViaturaEntity viaturaEntity;

    @BeforeEach
    void setUp() {
        viaturaDTO = ViaturaDTO.builder()
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
    }

    @Test
    void createViatura_Success() {
        when(mapper.toEntity(viaturaDTO)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(viaturaEntity)).thenReturn(viaturaEntity);
        when(ViaturaMapper.toDTO(viaturaEntity)).thenReturn(viaturaDTO);

        ViaturaDTO result = viaturaService.createViatura(viaturaDTO);

        assertEquals(viaturaDTO, result);
        verify(mapper).toEntity(viaturaDTO);
        verify(viaturaRepository).save(viaturaEntity);
        verify(mapper);
        ViaturaMapper.toDTO(viaturaEntity);
    }

    @Test
    void createViatura_DataIntegrityViolation() {
        when(mapper.toEntity(viaturaDTO)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(viaturaEntity))
                .thenThrow(new DataIntegrityViolationException("chave duplicada"));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> viaturaService.createViatura(viaturaDTO)
        );
        assertTrue(ex.getMessage().contains("Erro ao criar viatura"));
    }

    @Test
    void createViatura_MapperToEntityThrows() {
        when(mapper.toEntity(any())).thenThrow(new RuntimeException("map error"));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> viaturaService.createViatura(viaturaDTO)
        );
        assertEquals("map error", ex.getMessage());
    }

    @Test
    void createViatura_MapperToDTOThrows() {
        when(mapper.toEntity(viaturaDTO)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(viaturaEntity)).thenReturn(viaturaEntity);
        when(mapper.toDTO(any())).thenThrow(new RuntimeException("dto error"));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> viaturaService.createViatura(viaturaDTO)
        );
        assertEquals("dto error", ex.getMessage());
    }

    @Test
    void getViaturaById_Found() {
        when(viaturaRepository.findById(1L)).thenReturn(Optional.of(viaturaEntity));
        when(mapper.toDTO(viaturaEntity)).thenReturn(viaturaDTO);

        ViaturaDTO result = viaturaService.getViaturaById(1L);

        assertEquals(viaturaDTO, result);
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
        ViaturaDTO dto2 = ViaturaDTO.builder()
                .placa("DEF5G67")
                .modelo("ModeloY")
                .ano("2021")
                .tipoViatura("TipoB")
                .statusOperacional("Inativa")
                .idBase(2L)
                .itens(List.of(new Itens("Item2", 80)))
                .build();

        when(viaturaRepository.findAll()).thenReturn(List.of(viaturaEntity, e2));
        when(mapper.toDTO(viaturaEntity)).thenReturn(viaturaDTO);
        when(mapper.toDTO(e2)).thenReturn(dto2);

        List<ViaturaDTO> result = viaturaService.getAllViaturas();

        assertEquals(List.of(viaturaDTO, dto2), result);
    }

    @Test
    void getAllViaturas_EmptyList() {
        when(viaturaRepository.findAll()).thenReturn(Collections.emptyList());

        List<ViaturaDTO> result = viaturaService.getAllViaturas();

        assertTrue(result.isEmpty());
    }

    @Test
    void updateViatura_Success() {
        when(mapper.toEntity(viaturaDTO)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(viaturaEntity)).thenReturn(viaturaEntity);
        when(mapper.toDTO(viaturaEntity)).thenReturn(viaturaDTO);

        ViaturaDTO result = viaturaService.updateViatura(1L, viaturaDTO);

        assertEquals(viaturaDTO, result);
    }

    @Test
    void updateViatura_MapperToEntityThrows() {
        when(mapper.toEntity(any())).thenThrow(new RuntimeException("map error"));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> viaturaService.updateViatura(1L, viaturaDTO)
        );
        assertEquals("map error", ex.getMessage());
    }

    @Test
    void updateViatura_MapperToDTOThrows() {
        when(mapper.toEntity(viaturaDTO)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(viaturaEntity)).thenReturn(viaturaEntity);
        when(mapper.toDTO(any())).thenThrow(new RuntimeException("dto error"));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> viaturaService.updateViatura(1L, viaturaDTO)
        );
        assertEquals("dto error", ex.getMessage());
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

    @Test
    void deleteViatura_DeleteThrows() {
        when(viaturaRepository.existsById(1L)).thenReturn(true);
        doThrow(new RuntimeException("delete error")).when(viaturaRepository).deleteById(1L);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> viaturaService.deleteViatura(1L)
        );
        assertEquals("delete error", ex.getMessage());
    }
}