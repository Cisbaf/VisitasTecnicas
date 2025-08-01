package com.checklistitemservice.service;

import com.checklistitemservice.entity.CheckDescription;
import com.checklistitemservice.entity.CheckListEntity;
import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
import com.checklistitemservice.entity.enums.TipoConformidade;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CheckListMapperTest {

    private final CheckListMapper mapper = new CheckListMapper();

    @Test
    void toResponse_ValidEntity_ReturnsCorrectResponse() {
        List<CheckDescription> descriptions = Collections.singletonList(
                TestDataUtil.createCheckDescription("Teste completo", 100, TipoConformidade.CONFORME, "Aprovado")
        );

        CheckListEntity entity = new CheckListEntity(1L, "Categoria", descriptions);

        CheckListResponse response = mapper.toResponse(entity);

        assertEquals(1L, response.id());
        assertEquals("Categoria", response.categoria());

        CheckDescription desc = response.descricao().get(0);
        assertEquals("Teste completo", desc.getDescricao());
        assertEquals(100, desc.getConformidadePercent());
        assertEquals(TipoConformidade.CONFORME, desc.getTipoConformidade());
        assertEquals("Aprovado", desc.getObservacao());
    }

    @Test
    void toEntity_ValidRequest_ReturnsCorrectEntity() {
        List<CheckDescription> descriptions = Arrays.asList(
                TestDataUtil.createCheckDescription("Item 1", 50, TipoConformidade.PARCIAL, "Parcial"),
                TestDataUtil.createCheckDescription("Item 2", 0, TipoConformidade.NAO_CONFORME, "Rejeitado")
        );

        CheckListRequest request = new CheckListRequest("Categoria", descriptions);

        CheckListEntity entity = mapper.toEntity(request);

        assertNull(entity.getId());
        assertEquals("Categoria", entity.getCategoria());

        CheckDescription secondItem = entity.getDescricao().get(1);
        assertEquals("Item 2", secondItem.getDescricao());
        assertEquals(0, secondItem.getConformidadePercent());
        assertEquals(TipoConformidade.NAO_CONFORME, secondItem.getTipoConformidade());
        assertEquals("Rejeitado", secondItem.getObservacao());
    }

    @Test
    void toEntity_WithPartialData_ReturnsEntity() {
        CheckDescription partialDesc = CheckDescription.builder()
                .descricao("Descrição parcial")
                .conformidadePercent(75)
                // tipoConformidade e observacao omitidos
                .build();

        CheckListRequest request = new CheckListRequest("Parcial", Collections.singletonList(partialDesc));

        CheckListEntity entity = mapper.toEntity(request);

        assertNotNull(entity);
        assertEquals("Parcial", entity.getCategoria());
        assertEquals(75, entity.getDescricao().get(0).getConformidadePercent());
        assertNull(entity.getDescricao().get(0).getTipoConformidade());
    }

    @Test
    void toResponse_NullEntity_ReturnsNull() {
        assertNull(mapper.toResponse(null));
    }

    @Test
    void toEntity_NullRequest_ReturnsNull() {
        assertNull(mapper.toEntity(null));
    }
}