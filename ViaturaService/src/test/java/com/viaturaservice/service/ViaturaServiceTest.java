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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ViaturaServiceTest {

    @Mock
    private ViaturaRepository viaturaRepository;

    @Mock
    private ViaturaMapper mapper;

    @InjectMocks
    private ViaturaServiceImp viaturaService;

    private ViaturaRequest viaturaRequest;
    private ViaturaResponse viaturaResponse;
    private ViaturaEntity viaturaEntity;

    @BeforeEach
    void setUp() {
        viaturaRequest = ViaturaRequest.builder()
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .itens(List.of(new Itens()))
                .build();

        viaturaEntity = new ViaturaEntity();
        viaturaEntity.setId(1L);
        viaturaEntity.setPlaca("ABC1234");
        viaturaEntity.setModelo("Gol");
        viaturaEntity.setAno("2020");
        viaturaEntity.setTipoViatura("Patrulha");
        viaturaEntity.setStatusOperacional("Ativo");
        viaturaEntity.setIdBase(1L);
        viaturaEntity.setItens(List.of(new Itens()));
        viaturaResponse = ViaturaResponse.builder()
                .id(1L)
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .itens(List.of(new Itens()))
                .build();
    }

    @Test
    void createViaturaReturnsDTOWhenSuccess() {
        when(mapper.toEntity(viaturaRequest)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(viaturaEntity)).thenReturn(viaturaEntity);
        when(ViaturaMapper.toDTO(viaturaEntity)).thenReturn(viaturaResponse);

        ViaturaResponse result = viaturaService.createViatura(viaturaRequest);

        assertEquals(viaturaResponse, result);
    }

    @Test
    void createViaturaThrowsIllegalArgumentExceptionWhenDataIntegrityViolationOccurs() {
        when(mapper.toEntity(viaturaRequest)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(any(ViaturaEntity.class))).thenThrow(new DataIntegrityViolationException("Constraint violation"));

        assertThrows(IllegalArgumentException.class, () -> viaturaService.createViatura(viaturaRequest));
    }

    @Test
    void getViaturaByIdReturnsDTOWhenFound() {
        when(viaturaRepository.findById(1L)).thenReturn(Optional.of(viaturaEntity));
        when(ViaturaMapper.toDTO(viaturaEntity)).thenReturn(viaturaResponse);

        ViaturaResponse result = viaturaService.getViaturaById(1L);

        assertEquals(viaturaResponse, result);
    }

    @Test
    void getViaturaByIdThrowsRuntimeExceptionWhenViaturaNotFound() {
        when(viaturaRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> viaturaService.getViaturaById(1L));
    }

    @Test
    void getAllViaturasReturnsListOfDTOs() {
        when(viaturaRepository.findAll()).thenReturn(List.of(viaturaEntity));
        when(ViaturaMapper.toDTO(viaturaEntity)).thenReturn(viaturaResponse);

        List<ViaturaResponse> result = viaturaService.getAllViaturas();

        assertEquals(1, result.size());
        assertEquals(viaturaResponse, result.getFirst());
    }

    @Test
    void updateViaturaReturnsUpdatedDTOWhenSuccess() {
        when(viaturaRepository.findById(1L)).thenReturn(Optional.of(viaturaEntity));
        when(mapper.toEntity(viaturaRequest)).thenReturn(viaturaEntity);
        when(viaturaRepository.save(viaturaEntity)).thenReturn(viaturaEntity);
        when(ViaturaMapper.toDTO(viaturaEntity)).thenReturn(viaturaResponse);

        ViaturaResponse result = viaturaService.updateViatura(1L, viaturaRequest);

        assertEquals(viaturaResponse, result);
    }

    @Test
    void updateViaturaThrowsRuntimeExceptionWhenViaturaNotFound() {
        when(viaturaRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> viaturaService.updateViatura(1L, viaturaRequest));
    }

    @Test
    void deleteViaturaDeletesSuccessfullyWhenViaturaExists() {
        when(viaturaRepository.existsById(1L)).thenReturn(true);
        doNothing().when(viaturaRepository).deleteById(1L);

        assertDoesNotThrow(() -> viaturaService.deleteViatura(1L));
    }

    @Test
    void deleteViaturaThrowsRuntimeExceptionWhenViaturaDoesNotExist() {
        when(viaturaRepository.existsById(1L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> viaturaService.deleteViatura(1L));
    }
}