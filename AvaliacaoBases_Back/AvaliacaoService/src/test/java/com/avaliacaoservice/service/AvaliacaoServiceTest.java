package com.avaliacaoservice.service;

import com.avaliacaoservice.entity.AvaliacaoEntity;
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
        AvaliacaoEntity entity = createSampleAvaliacao();

        when(checkListExists.existsCheckListById(20L)).thenReturn(true);
        when(visitaExists.existsVisitaById(10L)).thenReturn(true);
        when(viaturaExists.existsViaturaById(30L)).thenReturn(true);
        when(avaliacaoRepository.save(entity)).thenReturn(entity);
        when(avaliacaoRepository.existsByIdVisitaAndIdCheckListAndIdViatura(10L, 20L, null)).thenReturn(false);

        // Act
        AvaliacaoEntity result = avaliacaoService.createAvaliacao(entity);

        // Assert
        assertNotNull(result);
        assertEquals(entity.getId(), result.getId());
    }

    @Test
    void createAvaliacao_CheckListNotFound_ThrowsException() {
        // Arrange
        AvaliacaoEntity entity = createSampleAvaliacao();
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

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.createAvaliacao(entity),
                "Viatura não existe com o id: 99");
    }


    @Test
    void createAll_Success() {
        // Arrange
        AvaliacaoEntity entity = createSampleAvaliacao();
        List<AvaliacaoEntity> entities = Collections.singletonList(entity);

        when(checkListExists.existsCheckListById(20L)).thenReturn(true);
        when(visitaExists.existsVisitaById(10L)).thenReturn(true);
        when(viaturaExists.existsViaturaById(30L)).thenReturn(true);
        when(avaliacaoRepository.saveAll(entities)).thenReturn(entities);
        when(avaliacaoRepository.existsByIdVisitaAndIdCheckListAndIdViatura(10L, 20L, null)).thenReturn(false);

        // Act
        List<AvaliacaoEntity> result = avaliacaoService.createAll(entities);

        // Assert
        assertEquals(1, result.size());
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
        AvaliacaoEntity entity = createSampleAvaliacao();

        when(avaliacaoRepository.existsById(id)).thenReturn(true);
        when(checkListExists.existsCheckListById(20L)).thenReturn(true);
        when(visitaExists.existsVisitaById(10L)).thenReturn(true);
        when(viaturaExists.existsViaturaById(30L)).thenReturn(true);
        when(avaliacaoRepository.save(entity)).thenReturn(entity);

        // Act
        AvaliacaoEntity result = avaliacaoService.updateAvaliacao(id, entity);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.getId());
    }

    @Test
    void updateAvaliacao_NotFound_ThrowsException() {
        // Arrange
        Long id = 1L;
        AvaliacaoEntity entity = createSampleAvaliacao();
        when(avaliacaoRepository.existsById(id)).thenReturn(false);

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.updateAvaliacao(id, entity),
                "Avaliação não encontrada com o id: " + id);
    }

    @Test
    void updateAvaliacao_CheckListNotFound_ThrowsException() {
        // Arrange
        Long id = 1L;
        AvaliacaoEntity entity = createSampleAvaliacao();
        when(avaliacaoRepository.existsById(id)).thenReturn(true);
        when(checkListExists.existsCheckListById(20L)).thenReturn(false);

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> avaliacaoService.updateAvaliacao(id, entity),
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