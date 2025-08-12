package com.checklistitemservice.service;

import com.checklistitemservice.entity.CheckDescription;
import com.checklistitemservice.entity.CheckListEntity;
import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
import com.checklistitemservice.entity.enums.TipoConformidade;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CheckListMapperTest {

    private final CheckListMapper mapper = new CheckListMapper();

    @Test
    void toResponse_WithValidEntity_ReturnsCorrectResponse() {
        // Arrange
        CheckListEntity entity = CheckListEntity.builder()
                .id(1L)
                .categoria("Segurança")
                .visitaId(10L)
                .descricao(List.of(
                        new CheckDescription(1L, "Item 1", 80, "OK", TipoConformidade.CONFORME, null),
                        new CheckDescription(2L, "Item 2", 30, "Problema", TipoConformidade.NAO_CONFORME, null)
                ))
                .build();

        // Act
        CheckListResponse response = mapper.toResponse(entity);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Segurança", response.categoria());
        assertEquals(10L, response.visitaId());
    }

    @Test
    void toResponse_WithNullEntity_ReturnsNull() {
        assertNull(mapper.toResponse(null));
    }

    @Test
    void toEntity_WithValidRequest_SetsCorrectConformidade() {
        // Arrange
        List<CheckDescription> descriptions = List.of(
                new CheckDescription(null, "Item 1", 30, null, null, null),
                new CheckDescription(null, "Item 2", 50, null, null, null),
                new CheckDescription(null, "Item 3", 80, null, null, null)
        );

        CheckListRequest request = new CheckListRequest("Segurança", 10L,descriptions);

        // Act
        CheckListEntity entity = mapper.toEntity(request);

        // Assert
        assertNotNull(entity);
        assertEquals("Segurança", entity.getCategoria());
        assertEquals(10L, entity.getVisitaId());

        // Verify conformidade types
        assertEquals(TipoConformidade.NAO_CONFORME, entity.getDescricao().get(0).getTipoConformidade());
        assertEquals(TipoConformidade.PARCIAL, entity.getDescricao().get(1).getTipoConformidade());
        assertEquals(TipoConformidade.CONFORME, entity.getDescricao().get(2).getTipoConformidade());
    }

    @Test
    void toEntity_WithNullRequest_ReturnsNull() {
        assertNull(mapper.toEntity(null));
    }
}