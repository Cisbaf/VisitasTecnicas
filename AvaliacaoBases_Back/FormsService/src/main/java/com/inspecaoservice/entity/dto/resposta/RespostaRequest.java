package com.inspecaoservice.entity.dto.resposta;

import com.inspecaoservice.entity.Resposta;
import com.inspecaoservice.entity.emuns.CheckBox;
import com.inspecaoservice.entity.emuns.Select;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.io.Serializable;

/**
 * DTO for {@link Resposta}
 */
public record RespostaRequest(
        String texto,
        CheckBox checkbox,
        Select select,
        @NotNull
        @Positive
        Long visitaId
) implements Serializable {
}