package com.checklistitemservice.entity.dto;

import com.checklistitemservice.entity.CheckDescription;
import com.checklistitemservice.entity.CheckListEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link CheckListEntity}
 */
@Builder
public record CheckListRequest(

        @NotBlank
        String categoria,
        @NotNull(message = "Visita é requerida")
        Long visitaId,
        @NotNull(message = "Itens do checklist são requeridos")
        List<CheckDescription> descricao

) implements Serializable { }