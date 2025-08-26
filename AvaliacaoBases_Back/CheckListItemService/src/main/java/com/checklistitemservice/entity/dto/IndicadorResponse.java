package com.checklistitemservice.entity.dto;

import com.checklistitemservice.entity.IndicadorOpEntity;
import lombok.Builder;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * DTO for {@link IndicadorOpEntity}
 */
@Builder
public record IndicadorResponse(
        Long id,
        Long TIHs,
        Map<String, Integer> atendimentos
) implements Serializable {
}