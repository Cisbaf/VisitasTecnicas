package com.formservice.entity.dto.resposta;

import com.formservice.entity.Resposta;
import com.formservice.entity.emuns.CheckBox;
import lombok.Builder;

import java.io.Serializable;

/**
 * DTO for {@link Resposta}
 */
@Builder
public record RespostaResponse(
        Long id,
        String texto,
        CheckBox checkbox,
        Long visitaId,
        Long campo
) implements Serializable {
}