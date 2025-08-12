package com.checklistitemservice.service;

import com.checklistitemservice.entity.CheckListEntity;
import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
import com.checklistitemservice.respository.CheckListRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CheckListServiceImpTest {

    @Mock
    private CheckListRepository repository;

    @Mock
    private CheckListMapper mapper;

    @InjectMocks
    private CheckListServiceImp service;

    @Test
    void createCheckList_WithValidRequest_ReturnsResponse() {
        // Arrange
        CheckListRequest request = new CheckListRequest("Segurança", 10L, List.of());
        CheckListEntity entity = new CheckListEntity();
        CheckListResponse response = new CheckListResponse(1L, "Segurança", List.of(), 10L);

        when(repository.existsByCategoria("Segurança")).thenReturn(false);
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        // Act
        CheckListResponse result = service.createCheckList(request);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.id());
        verify(repository).existsByCategoria("Segurança");
        verify(repository).save(entity);
    }

    @Test
    void createCheckList_WithExistingCategory_ThrowsException() {
        CheckListRequest request = new CheckListRequest("Segurança", 10L,List.of());
        when(repository.existsByCategoria("Segurança")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> service.createCheckList(request),
                "Já existe um CheckList com a categoria: Segurança");
    }

    @Test
    void getById_WithExistingId_ReturnsResponse() {
        // Arrange
        Long id = 1L;
        CheckListEntity entity = new CheckListEntity();
        CheckListResponse response = new CheckListResponse(id, "Segurança", List.of(), 10L);

        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(mapper.toResponse(entity)).thenReturn(response);

        // Act
        CheckListResponse result = service.getById(id);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.id());
    }

    @Test
    void getByVisitaId_WithNoResults_ReturnsEmptyList() {
        Long visitaId = 10L;
        when(repository.findAllByVisitaId(visitaId)).thenReturn(List.of());

        List<CheckListResponse> result = service.getByVisitaId(visitaId);

        assertTrue(result.isEmpty());
    }

    @Test
    void update_WithValidData_ReturnsUpdatedResponse() {
        // Arrange
        Long id = 1L;
        CheckListRequest request = new CheckListRequest("Updated", 20L, List.of());
        CheckListEntity existing = new CheckListEntity();
        existing.setId(id);

        CheckListEntity updated = new CheckListEntity();
        updated.setId(id);

        CheckListResponse response = new CheckListResponse(id, "Updated", List.of(), 20L);

        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(mapper.toEntity(request)).thenReturn(updated);
        when(repository.save(updated)).thenReturn(updated);
        when(mapper.toResponse(updated)).thenReturn(response);

        // Act
        CheckListResponse result = service.update(id, request);

        // Assert
        assertNotNull(result);
        assertEquals("Updated", result.categoria());
        assertEquals(20L, result.visitaId());
    }
    @Test
    void createCheckList_WithNullRequest_ThrowsException() {
        assertThrows(IllegalArgumentException.class,
                () -> service.createCheckList(null),
                "CheckList não pode ser nulo");
    }

    @Test
    void createCheckLists_WithAllExistingCategories_ThrowsException() {
        List<CheckListRequest> requests = List.of(
                new CheckListRequest("Segurança", 10L, List.of()),
                new CheckListRequest("Limpeza", 10L, List.of())
        );

        when(repository.existsByCategoria(anyString())).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> service.createCheckLists(requests),
                "Nenhum CheckList foi criado, todas as categorias já existem.");
    }

    @Test
    void getById_WithNullId_ThrowsException() {
        assertThrows(IllegalArgumentException.class,
                () -> service.getById(null),
                "ID não pode ser nulo");
    }

    @Test
    void update_WithNullId_ThrowsException() {
        CheckListRequest request = new CheckListRequest("Segurança", 10L, List.of());
        assertThrows(IllegalArgumentException.class,
                () -> service.update(null, request),
                "ID e CheckList não podem ser nulos");
    }

    @Test
    void deleteCheckList_WithNullId_ThrowsException() {
        assertThrows(IllegalArgumentException.class,
                () -> service.deleteCheckList(null),
                "ID não pode ser nulo");
    }
}