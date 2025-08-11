package com.visitaservice.service.visita;

import com.visitaservice.entity.EquipeTecnica;
import com.visitaservice.entity.VisitaEntity;
import com.visitaservice.entity.dto.visita.VisitaRequest;
import com.visitaservice.entity.dto.visita.VisitaResponse;
import com.visitaservice.repository.VisitaRepository;
import com.visitaservice.service.IdBaseExists;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static com.visitaservice.service.visita.VisitaMapper.toResponse;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class VisitaServiceImpTest {

    @Mock
    private VisitaRepository repository;

    @Mock
    private IdBaseExists exists;

    @InjectMocks
    private VisitaServiceImp service;

    private VisitaRequest request;
    private VisitaEntity entity;
    private VisitaResponse response;
    private final Long EXISTING_ID = 1L;
    private final Long NON_EXISTING_ID = 99L;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        List<EquipeTecnica> membros = List.of(
                new EquipeTecnica("Ana", "Médica"),
                new EquipeTecnica("Bruno", "Paramédico")
        );

        request = VisitaRequest.builder()
                .dataVisita(LocalDate.now())  // 1 ago 2021
                .idBase(EXISTING_ID)
                .membros(membros)
                .build();

        entity = VisitaEntity.builder()
                .id(EXISTING_ID)
                .dataVisita(request.getDataVisita())
                .idBase(request.getIdBase())
                .membros(membros)
                .build();

        response = VisitaResponse.builder()
                .id(EXISTING_ID)
                .dataVisita(request.getDataVisita())
                .idBase(request.getIdBase())
                .membros(membros)
                .build();
    }

    @Test
    void createVisita_deveCriar_quandoBaseExiste() {
        when(exists.existsById(EXISTING_ID)).thenReturn(true);
        when(repository.save(entity)).thenReturn(entity);

        try (MockedStatic<VisitaMapper> mockStatic = Mockito.mockStatic(VisitaMapper.class)) {
            mockStatic.when(() -> toResponse(entity)).thenReturn(response);

            VisitaResponse result = service.createVisita(request);

            assertNotNull(result);
            assertEquals(EXISTING_ID, result.id());
            mockStatic.verify(() -> toResponse(entity));
            verify(repository).save(entity);
        }
    }

    @Test
    void createVisita_deveLancar_quandoBaseNaoExiste() {
        when(exists.existsById(EXISTING_ID)).thenReturn(false);
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.createVisita(request)
        );
        assertTrue(ex.getMessage().contains("Base não existe"));
    }

    @Test
    void getById_deveRetornar_quandoVisitaExiste() {
        when(repository.findById(EXISTING_ID)).thenReturn(Optional.of(entity));

        try (MockedStatic<VisitaMapper> mockStatic = Mockito.mockStatic(VisitaMapper.class)) {
            mockStatic.when(() -> toResponse(entity)).thenReturn(response);

            VisitaResponse result = service.getById(EXISTING_ID);

            assertEquals(EXISTING_ID, result.id());
            mockStatic.verify(() -> toResponse(entity));
        }
    }

    @Test
    void getById_deveLancar_quandoNaoEncontrada() {
        when(repository.findById(NON_EXISTING_ID)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.getById(NON_EXISTING_ID)
        );
        assertTrue(ex.getMessage().contains("Visita não encontrada"));
    }

    @Test
    void getAll_deveRetornarListaVazia_quandoNenhumRegistro() {
        when(repository.findAll()).thenReturn(Collections.emptyList());

        List<VisitaResponse> list = service.getAll();
        assertNotNull(list);
        assertTrue(list.isEmpty());
    }

    @Test
    void getAll_deveRetornarLista_quandoExistirRegistros() {
        when(repository.findAll()).thenReturn(List.of(entity));

        try (MockedStatic<VisitaMapper> mockStatic = Mockito.mockStatic(VisitaMapper.class)) {
            mockStatic.when(() -> toResponse(entity)).thenReturn(response);

            List<VisitaResponse> list = service.getAll();

            assertEquals(1, list.size());
            assertEquals(EXISTING_ID, list.getFirst().id());
            mockStatic.verify(() -> toResponse(entity));
        }
    }

    @Test
    void updateVisita_deveAtualizar_quandoVisitaExiste() {
        when(repository.existsById(EXISTING_ID)).thenReturn(true);
        when(repository.findById(EXISTING_ID)).thenReturn(Optional.of(entity));
        when(repository.save(entity)).thenReturn(entity);

        try (MockedStatic<VisitaMapper> mockStatic = Mockito.mockStatic(VisitaMapper.class)) {
            mockStatic.when(() -> toResponse(entity)).thenReturn(response);

            VisitaResponse result = service.updateVisita(EXISTING_ID, request);

            assertEquals(EXISTING_ID, result.id());
            mockStatic.verify(() -> toResponse(entity));
            verify(repository).save(entity);
        }
    }

    @Test
    void updateVisita_deveLancar_quandoNaoExiste() {
        when(repository.existsById(NON_EXISTING_ID)).thenReturn(false);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.updateVisita(NON_EXISTING_ID, request)
        );
        assertTrue(ex.getMessage().contains("Visita não encontrada"));
    }

    @Test
    void delete_deveRemover_quandoExiste() {
        when(repository.existsById(EXISTING_ID)).thenReturn(true);
        doNothing().when(repository).deleteById(EXISTING_ID);

        assertDoesNotThrow(() -> service.delete(EXISTING_ID));
        verify(repository).deleteById(EXISTING_ID);
    }

    @Test
    void delete_deveLancar_quandoNaoExiste() {
        when(repository.existsById(NON_EXISTING_ID)).thenReturn(false);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.delete(NON_EXISTING_ID)
        );
        assertTrue(ex.getMessage().contains("Visita não encontrada"));
    }

    @Test
    void existsVisitaById_retornaBooleanCorreto() {
        when(repository.existsById(EXISTING_ID)).thenReturn(true);
        assertTrue(service.existsVisitaById(EXISTING_ID));
        when(repository.existsById(NON_EXISTING_ID)).thenReturn(false);
        assertFalse(service.existsVisitaById(NON_EXISTING_ID));
    }
}
