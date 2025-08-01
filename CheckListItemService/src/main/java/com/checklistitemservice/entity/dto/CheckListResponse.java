package com.checklistitemservice.entity.dto;

import com.checklistitemservice.entity.CheckDescription;
import lombok.Builder;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link com.checklistitemservice.entity.CheckListEntity}
 */
@Builder
public record CheckListResponse(Long id, String categoria, List<CheckDescription> descricao) implements Serializable {
}