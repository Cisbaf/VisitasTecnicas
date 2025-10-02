package com.formservice.entity.dto;

import com.formservice.entity.CheckDescription;
import com.formservice.entity.CheckListEntity;
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