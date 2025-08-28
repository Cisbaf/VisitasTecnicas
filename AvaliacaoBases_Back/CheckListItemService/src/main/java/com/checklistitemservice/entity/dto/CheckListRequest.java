package com.checklistitemservice.entity.dto;

import com.checklistitemservice.entity.CheckDescription;
import com.checklistitemservice.entity.CheckListEntity;
import jakarta.validation.constraints.NotBlank;
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
        List<CheckDescription> descricao

) implements Serializable {}