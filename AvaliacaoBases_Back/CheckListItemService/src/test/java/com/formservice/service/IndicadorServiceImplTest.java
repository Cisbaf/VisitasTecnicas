package com.formservice.service;

import com.formservice.entity.IndicadorOpEntity;
import com.formservice.entity.dto.IndicadorRequest;
import com.formservice.entity.dto.IndicadorResponse;
import com.formservice.respository.IndicadorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IndicadorServiceImplTest {

    @Mock
    private IndicadorRepository repository;

    @Mock
    private IndicadorMapper mapper;

    @InjectMocks
    private IndicadorServiceImpl service;

    @Test
    void save_WithValidRequest_ReturnsResponse() {
        // Arrange
        IndicadorRequest request = new IndicadorRequest(100L, Map.of(), null, null);
        IndicadorOpEntity entity = new IndicadorOpEntity();
        IndicadorResponse response = new IndicadorResponse(1L, 100L, Map.of());

        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        // Act
        IndicadorResponse result = service.save(request);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.id());
        verify(repository).save(entity);
    }

    @Test
    void update_WithNonExistingId_ThrowsException() {
        Long id = 1L;
        IndicadorRequest request = new IndicadorRequest(100L, Map.of(), null, null);

        when(repository.existsById(id)).thenReturn(false);

        assertThrows(RuntimeException.class,
                () -> service.update(id, request),
                "Indicador not found with id: " + id);
    }

    @Test
    void getAll_ReturnsListOfResponses() {
        // Arrange
        IndicadorOpEntity entity = new IndicadorOpEntity();
        IndicadorResponse response = new IndicadorResponse(1L, 100L, Map.of());

        when(repository.findAll()).thenReturn(List.of(entity));
        when(mapper.toResponse(entity)).thenReturn(response);

        // Act
        List<IndicadorResponse> result = service.getAll();

        // Assert
        assertEquals(1, result.size());
        assertEquals(1L, result.getFirst().id());
    }
    @Test
    void getById_WithNonExistingId_ThrowsException() {
        Long id = 999L;
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.getById(id),
                "Indicador not found with id: " + id);
    }

    @Test
    void delete_WithNonExistingId_ThrowsException() {
        Long id = 999L;
        when(repository.existsById(id)).thenReturn(false);

        assertThrows(RuntimeException.class,
                () -> service.delete(id),
                "Indicador not found with id: " + id);
    }


    @Test
    void update_WithNullRequest_ThrowsException() {
        Long id = 1L;
        when(repository.existsById(id)).thenReturn(true);

        assertThrows(NullPointerException.class,
                () -> service.update(id, null));
    }
}