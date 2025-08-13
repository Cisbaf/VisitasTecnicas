package com.avaliacaoservice.service;

import com.avaliacaoservice.entity.AvaliacaoEntity;
import com.avaliacaoservice.entity.AvaliacaoRequest;
import com.avaliacaoservice.repository.AvaliacaoRepository;
import com.avaliacaoservice.service.exists.CheckListExists;
import com.avaliacaoservice.service.exists.ViaturaExists;
import com.avaliacaoservice.service.exists.VisitaExists;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvaliacaoServiceTest {

    @Mock
    private AvaliacaoRepository avaliacaoRepository;

    @Mock
    private CheckListExists checkListExists;

    @Mock
    private VisitaExists visitaExists;

    @Mock
    private ViaturaExists viaturaExists;

    @InjectMocks
    private AvaliacaoService avaliacaoService;

    private AvaliacaoEntity createSampleAvaliacao() {
        return AvaliacaoEntity.builder()
                .id(1L)
                .idVisita(10L)
                .idCheckList(20L)
                .idViatura(30L)
                .build();
    }

    private AvaliacaoRequest createSampleAvaliacaoRequest() {
        return AvaliacaoRequest.builder()
                .idVisita(10L)
                .idCheckList(20L)
                .idViatura(30L)
                .build();
    }


    @Test
    void findById_Success() {
        // Arrange
        Long id = 1L;
        AvaliacaoEntity entity = createSampleAvaliacao();
        when(avaliacaoRepository.findById(id)).thenReturn(Optional.of(entity));

        // Act
        AvaliacaoEntity result = avaliacaoService.findById(id);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.getId());
    }

    @Test
    void findById_NotFound_ThrowsException() {
        // Arrange
        Long id = 1L;
        when(avaliacaoRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.findById(id),
                "Avaliação não encontrada com o id: " + id);
    }

    @Test
    void findAll_Success() {
        // Arrange
        AvaliacaoEntity entity = createSampleAvaliacao();
        when(avaliacaoRepository.findAll()).thenReturn(Collections.singletonList(entity));

        // Act
        List<AvaliacaoEntity> result = avaliacaoService.findAll();

        // Assert
        assertEquals(1, result.size());
        assertEquals(entity.getId(), result.getFirst().getId());
    }

    @Test
    void findByIdVisita_Success() {
        // Arrange
        Long idVisita = 10L;
        AvaliacaoEntity entity = createSampleAvaliacao();

        when(visitaExists.existsVisitaById(idVisita)).thenReturn(true);
        when(avaliacaoRepository.findByIdVisita(idVisita)).thenReturn(Collections.singletonList(entity));

        // Act
        List<AvaliacaoEntity> result = avaliacaoService.findByIdVisita(idVisita);

        // Assert
        assertEquals(1, result.size());
        assertEquals(idVisita, result.getFirst().getIdVisita());
    }

    @Test
    void findByIdVisita_VisitaNotFound_ThrowsException() {
        // Arrange
        Long idVisita = 10L;
        when(visitaExists.existsVisitaById(idVisita)).thenReturn(false);

        // Act & Assert
        assertThrows(RuntimeException.class,
                () -> avaliacaoService.findByIdVisita(idVisita),
                "Visita não encontrada com o id: " + idVisita);
    }

    @Test
    void createAvaliacao_Success() {
        // Arrange
        AvaliacaoRequest request = createSampleAvaliacaoRequest();

        when(checkListExists.existsCheckListById(20L)).thenReturn(true);
        when(visitaExists.existsVisitaById(10L)).thenReturn(true);
        when(viaturaExists.existsViaturaById(30L)).thenReturn(true);
        when(avaliacaoRepository.existsByIdVisitaAndIdCheckListAndIdViatura(10L, 20L, 30L)).thenReturn(false);

        // Configuração correta do mock para qualquer entidade
        when(avaliacaoRepository.save(any(AvaliacaoEntity.class))).thenAnswer(invocation -> {
            AvaliacaoEntity entity = invocation.getArgument(0);
            return AvaliacaoEntity.builder()
                    .id(1L) // ID gerado
                    .idVisita(entity.getIdVisita())
                    .idCheckList(entity.getIdCheckList())
                    .idViatura(entity.getIdViatura())
                    .build();
        });

        // Act
        AvaliacaoEntity result = avaliacaoService.createAvaliacao(request);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId()); // Verifica se o ID foi atribuído
    }

    @Test
    void createAvaliacao_CheckListNotFound_ThrowsException() {
        // Arrange
        var entity = createSampleAvaliacaoRequest();
        when(checkListExists.existsCheckListById(20L)).thenReturn(false);

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.createAvaliacao(entity),
                "CheckList ou Visita não existe");
    }

    @Test
    void createAvaliacao_ViaturaNotFound_ThrowsException() {
        // Arrange
        AvaliacaoEntity entity = createSampleAvaliacao();
        entity.setIdViatura(99L); // ID inválido

        when(checkListExists.existsCheckListById(20L)).thenReturn(true);
        when(visitaExists.existsVisitaById(10L)).thenReturn(true);
        when(viaturaExists.existsViaturaById(99L)).thenReturn(false);

        var request = AvaliacaoRequest.builder()
                .idVisita(10L)
                .idCheckList(20L)
                .idViatura(99L)
                .build();
        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.createAvaliacao(request),
                "Viatura não existe com o id: 99");
    }


    @Test
    void createAll_Success() {
        // Arrange
        var request = AvaliacaoRequest.builder()
                .idVisita(10L)
                .idCheckList(20L)
                .idViatura(30L)
                .build();
        List<AvaliacaoRequest> requests = List.of(request);

        when(checkListExists.existsCheckListById(20L)).thenReturn(true);
        when(visitaExists.existsVisitaById(10L)).thenReturn(true);
        when(viaturaExists.existsViaturaById(30L)).thenReturn(true);
        when(avaliacaoRepository.existsByIdVisitaAndIdCheckListAndIdViatura(10L, 20L, 30L)).thenReturn(false);

        // Configurar saveAll para retornar entidades com IDs gerados
        when(avaliacaoRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<AvaliacaoEntity> entities = invocation.getArgument(0);
            return entities.stream()
                    .map(e -> AvaliacaoEntity.builder()
                            .id(1L) // ID gerado
                            .idVisita(e.getIdVisita())
                            .idCheckList(e.getIdCheckList())
                            .idViatura(e.getIdViatura())
                            .build())
                    .collect(Collectors.toList());
        });

        // Act
        List<AvaliacaoEntity> result = avaliacaoService.createAll(requests);

        // Assert
        assertEquals(1, result.size());
        assertEquals(1L, result.getFirst().getId()); // Verifica ID gerado
        assertEquals(request.idVisita(), result.getFirst().getIdVisita());
    }

    @Test
    void createAll_EmptyList_ThrowsException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.createAll(null),
                "Lista de avaliações não pode ser nula ou vazia");

        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.createAll(Collections.emptyList()),
                "Lista de avaliações não pode ser nula ou vazia");
    }

    @Test
    void updateAvaliacao_Success() {
        // Arrange
        Long id = 1L;
        var request = AvaliacaoRequest.builder()
                .idVisita(10L)
                .idCheckList(20L)
                .idViatura(30L)
                .build();

        when(avaliacaoRepository.existsById(id)).thenReturn(true);
        when(checkListExists.existsCheckListById(20L)).thenReturn(true);
        when(visitaExists.existsVisitaById(10L)).thenReturn(true);
        when(viaturaExists.existsViaturaById(30L)).thenReturn(true);

        // Usar any() para capturar qualquer entidade passada
        when(avaliacaoRepository.save(any(AvaliacaoEntity.class))).thenAnswer(invocation -> {
            AvaliacaoEntity entity = invocation.getArgument(0);
            // Retorna uma nova entidade com ID e dados atualizados
            return AvaliacaoEntity.builder()
                    .id(entity.getId() != null ? entity.getId() : id)
                    .idVisita(entity.getIdVisita())
                    .idCheckList(entity.getIdCheckList())
                    .idViatura(entity.getIdViatura())
                    .build();
        });

        // Act
        var result = avaliacaoService.updateAvaliacao(id, request);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.getId());
        assertEquals(request.idVisita(), result.getIdVisita());
    }


    @Test
    void updateAvaliacao_NotFound_ThrowsException() {
        // Arrange
        Long id = 1L;
        when(avaliacaoRepository.existsById(id)).thenReturn(false);

        var request = AvaliacaoRequest.builder()
                .idVisita(10L)
                .idCheckList(20L)
                .idViatura(30L)
                .build();

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.updateAvaliacao(id, request),
                "Avaliação não encontrada com o id: " + id);
    }

    @Test
    void updateAvaliacao_CheckListNotFound_ThrowsException() {
        // Arrange
        Long id = 1L;
        when(avaliacaoRepository.existsById(id)).thenReturn(true);
        when(checkListExists.existsCheckListById(20L)).thenReturn(false);

        var request = AvaliacaoRequest.builder()
                .idVisita(10L)
                .idCheckList(20L)
                .idViatura(30L)
                .build();

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.updateAvaliacao(id, request),
                "CheckList, Viatura ou Visita não existe");
    }

    @Test
    void deleteAvaliacao_Success() {
        // Arrange
        Long id = 1L;
        when(avaliacaoRepository.existsById(id)).thenReturn(true);
        doNothing().when(avaliacaoRepository).deleteById(id);

        // Act & Assert
        assertDoesNotThrow(() -> avaliacaoService.deleteAvaliacao(id));
        verify(avaliacaoRepository).deleteById(id);
    }

    @Test
    void deleteAvaliacao_NotFound_ThrowsException() {
        // Arrange
        Long id = 1L;
        when(avaliacaoRepository.existsById(id)).thenReturn(false);

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.deleteAvaliacao(id),
                "Avaliação não encontrada com o id: " + id);
    }
}