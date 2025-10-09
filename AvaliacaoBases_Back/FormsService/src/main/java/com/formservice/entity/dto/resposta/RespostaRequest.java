package com.formservice.entity.dto.resposta;

import com.formservice.entity.Resposta;
import com.formservice.entity.emuns.CheckBox;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.io.Serializable;

/**
 * DTO for {@link Resposta}
 */
public record RespostaRequest(
        String texto,
        CheckBox checkbox,
        @NotNull
        @Positive
        Long visitaId
) implements Serializable {
}