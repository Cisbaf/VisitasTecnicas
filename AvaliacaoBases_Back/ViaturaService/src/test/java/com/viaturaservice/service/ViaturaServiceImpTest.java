package com.viaturaservice.service;

import com.viaturaservice.entity.ViaturaEntity;
import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaResponse;
import com.viaturaservice.repository.ViaturaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ViaturaServiceImpTest {

    @Mock
    private ViaturaRepository repository;

    @Mock
    private ViaturaMapper mapper;

    @InjectMocks
    private ViaturaServiceImp service;

    private ViaturaRequest request;
    private ViaturaEntity entity;
    private ViaturaResponse response;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        request = ViaturaRequest.builder()
                .placa("ABC1234")
                .modelo("Modelo")
                .ano("2023")
                .tipoViatura("Tipo")
                .statusOperacional("Operando")
                .idBase(1L)
                .itens(Collections.emptyList())
                .build();

        entity = ViaturaEntity.builder()
                .id(1L)
                .placa("ABC1234")
                .tipoViatura("Tipo")
                .statusOperacional("Operando")
                .idBase(1L)
                .itens(Collections.emptyList())
                .build();

        response = ViaturaResponse.builder()
                .id(1L)
                .placa("ABC1234")
                .tipoViatura("Tipo")
                .statusOperacional("Operando")
                .idBase(1L)
                .itens(Collections.emptyList())
                .build();
    }

    @Test
    void createViatura_deveRetornarResponse_quandoSucesso() {
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);

        try (MockedStatic<ViaturaMapper> mocked = Mockito.mockStatic(ViaturaMapper.class)) {
            mocked.when(() -> ViaturaMapper.toDTO(entity)).thenReturn(response);

            ViaturaResponse result = service.createViatura(request);

            assertNotNull(result);
            assertEquals("ABC1234", result.placa());
            verify(repository).save(entity);
            mocked.verify(() -> ViaturaMapper.toDTO(entity));
        }
    }

    @Test
    void createViatura_deveLancarExcecao_quandoErroDeIntegridade() {
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenThrow(DataIntegrityViolationException.class);

        assertThrows(IllegalArgumentException.class, () -> service.createViatura(request));
    }

    @Test
    void createViatura_deveLancarExcecao_quandoRequestForNulo() {
        assertThrows(NullPointerException.class, () -> service.createViatura(null));
    }

    @Test
    void createViatura_deveLancarExcecao_quandoCamposObrigatoriosForemNulos() {
        ViaturaRequest requestInvalido = ViaturaRequest.builder()
                .placa(null)
                .modelo(null)
                .ano(null)
                .tipoViatura(null)
                .statusOperacional(null)
                .idBase(null)
                .itens(null)
                .build();

        when(mapper.toEntity(requestInvalido)).thenThrow(new IllegalArgumentException("Campos inválidos"));

        assertThrows(IllegalArgumentException.class, () -> service.createViatura(requestInvalido));
    }

    @Test
    void getViaturaById_deveRetornarResponse_quandoEncontrado() {
        when(repository.findById(1L)).thenReturn(Optional.of(entity));

        try (MockedStatic<ViaturaMapper> mocked = Mockito.mockStatic(ViaturaMapper.class)) {
            mocked.when(() -> ViaturaMapper.toDTO(entity)).thenReturn(response);

            ViaturaResponse result = service.getViaturaById(1L);

            assertEquals(1L, result.id());
            mocked.verify(() -> ViaturaMapper.toDTO(entity));
        }
    }

    @Test
    void getViaturaById_deveLancarExcecao_quandoNaoEncontrado() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.getViaturaById(1L));
    }

    @Test
    void getViaturaById_deveLancarExcecao_quandoIdForNulo() {
        assertThrows(RuntimeException.class, () -> service.getViaturaById(null));
    }

    @Test
    void getViaturaById_deveLancarExcecao_quandoIdForNegativo() {
        when(repository.findById(-10L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.getViaturaById(-10L));
    }

    @Test
    void getAllViaturas_deveRetornarLista() {
        when(repository.findAll()).thenReturn(List.of(entity));

        try (MockedStatic<ViaturaMapper> mocked = Mockito.mockStatic(ViaturaMapper.class)) {
            mocked.when(() -> ViaturaMapper.toDTO(entity)).thenReturn(response);

            List<ViaturaResponse> list = service.getAllViaturas();

            assertEquals(1, list.size());
            assertEquals("ABC1234", list.getFirst().placa());
            mocked.verify(() -> ViaturaMapper.toDTO(entity));
        }
    }

    @Test
    void getAllViaturas_deveRetornarListaVazia_quandoNenhumRegistro() {
        when(repository.findAll()).thenReturn(Collections.emptyList());

        List<ViaturaResponse> list = service.getAllViaturas();

        assertNotNull(list);
        assertTrue(list.isEmpty());
    }

    @Test
    void updateViatura_deveRetornarAtualizado() {
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);

        try (MockedStatic<ViaturaMapper> mocked = Mockito.mockStatic(ViaturaMapper.class)) {
            mocked.when(() -> ViaturaMapper.toDTO(entity)).thenReturn(response);

            ViaturaResponse result = service.updateViatura(1L, request);

            assertNotNull(result);
            assertEquals("ABC1234", result.placa());
            mocked.verify(() -> ViaturaMapper.toDTO(entity));
        }
    }

    @Test
    void updateViatura_deveLancarExcecao_quandoIdForNulo() {
        when(mapper.toEntity(request)).thenReturn(entity);

        assertThrows(NullPointerException.class, () -> service.updateViatura(null, request));
    }

    @Test
    void deleteViatura_deveExcluir_quandoExiste() {
        when(repository.existsById(1L)).thenReturn(true);
        doNothing().when(repository).deleteById(1L);

        service.deleteViatura(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    void deleteViatura_deveLancarExcecao_quandoIdNaoExiste() {
        when(repository.existsById(999L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.deleteViatura(999L));
        assertEquals("Viatura não encontrada para exclusão.", ex.getMessage());
    }
}
