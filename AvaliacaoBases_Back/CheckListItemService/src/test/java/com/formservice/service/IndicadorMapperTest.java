package com.formservice.service;

import com.formservice.entity.IndicadorOpEntity;
import com.formservice.entity.dto.IndicadorRequest;
import com.formservice.entity.dto.IndicadorResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
class IndicadorMapperTest {

    @InjectMocks
    private IndicadorMapper mapper;

    @Test
    void toResponse_WithValidEntity_ReturnsCorrectResponse() {
        // Arrange
        IndicadorOpEntity entity = IndicadorOpEntity.builder()
                .id(1L)
                .TIHs(100L)
                .atendimentos(Map.of("Tipo1", 50))
                .build();

        // Act
        IndicadorResponse response = mapper.toResponse(entity);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(100L, response.TIHs());
    }

    @Test
    void toEntity_WithDates_CallsClientWithCorrectDates() {
        // Arrange
        LocalDate startDate = LocalDate.of(2023, 1, 1);
        LocalDate endDate = LocalDate.of(2023, 12, 31);
        IndicadorRequest request = new IndicadorRequest(100L, Map.of(), startDate, endDate);


        // Act
        IndicadorOpEntity entity = mapper.toEntity(request);

        // Assert
        assertNotNull(entity);
        assertEquals(100L, entity.getTIHs());
    }

    @Test
    void toEntity_WithoutDates_UsesDefaultDates() {
        // Arrange
        IndicadorRequest request = new IndicadorRequest(100L, Map.of(), null, null);
        // Act
        IndicadorOpEntity entity = mapper.toEntity(request);

        // Assert
        assertNotNull(entity);
    }

}