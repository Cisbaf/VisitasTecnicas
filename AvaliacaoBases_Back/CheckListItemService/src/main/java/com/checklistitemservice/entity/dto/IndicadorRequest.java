package com.checklistitemservice.entity.dto;

import com.checklistitemservice.entity.IndicadorOpEntity;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Map;

/**
 * DTO for {@link IndicadorOpEntity}
 */
public record IndicadorRequest(
        @NotNull(message = "O numero se TIHs emitidos é requerido")
        @PositiveOrZero(message = "O numero de TIHs deve ser positivo ou zero")
        Long TIHs,
        @NotNull(message = "Você deve adicionar pelo menos um atendimento por codigo")
        Map<String, Integer> atendimentos,
        LocalDate dataInicio,
        LocalDate dataFim
) implements Serializable {
}