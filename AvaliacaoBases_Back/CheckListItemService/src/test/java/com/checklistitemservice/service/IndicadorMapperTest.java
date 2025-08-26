package com.checklistitemservice.service;

import com.checklistitemservice.entity.IndicadorOpEntity;
import com.checklistitemservice.entity.dto.IndicadorRequest;
import com.checklistitemservice.entity.dto.IndicadorResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IndicadorMapperTest {

    @Mock
    private RelatorioServiceClient client;

    @InjectMocks
    private IndicadorMapper mapper;

    @Test
    void toResponse_WithValidEntity_ReturnsCorrectResponse() {
        // Arrange
        IndicadorOpEntity entity = IndicadorOpEntity.builder()
                .id(1L)
                .TIHs(100L)
                .atendimentos(Map.of("Tipo1", 50))
                .rankingBases(List.of(new BaseRankingDTO("Base1", 1L,80.0, LocalDate.now(), 3)))
                .build();

        // Act
        IndicadorResponse response = mapper.toResponse(entity);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(100L, response.TIHs());
        assertEquals(1, response.rankingBases().size());
    }

    @Test
    void toEntity_WithDates_CallsClientWithCorrectDates() {
        // Arrange
        LocalDate startDate = LocalDate.of(2023, 1, 1);
        LocalDate endDate = LocalDate.of(2023, 12, 31);
        IndicadorRequest request = new IndicadorRequest(100L, Map.of(), startDate, endDate);

        when(client.getRankingVisitas(startDate, endDate))
                .thenReturn(List.of(new BaseRankingDTO("Base1", 1L,80.0, LocalDate.now(), 3)));

        // Act
        IndicadorOpEntity entity = mapper.toEntity(request);

        // Assert
        assertNotNull(entity);
        assertEquals(100L, entity.getTIHs());
        verify(client).getRankingVisitas(startDate, endDate);
    }

    @Test
    void toEntity_WithoutDates_UsesDefaultDates() {
        // Arrange
        IndicadorRequest request = new IndicadorRequest(100L, Map.of(), null, null);
        LocalDate expectedStart = LocalDate.now().withDayOfYear(1);
        LocalDate expectedEnd = LocalDate.now();

        when(client.getRankingVisitas(expectedStart, expectedEnd))
                .thenReturn(List.of(new BaseRankingDTO("Base1", 1L,80.0, LocalDate.now(), 3)));

        // Act
        IndicadorOpEntity entity = mapper.toEntity(request);

        // Assert
        assertNotNull(entity);
        verify(client).getRankingVisitas(expectedStart, expectedEnd);
    }

}