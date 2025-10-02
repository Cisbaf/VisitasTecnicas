package com.formservice.entity.dto.resposta;

import com.formservice.entity.Resposta;
import com.formservice.entity.emuns.CheckBox;
import com.formservice.entity.emuns.Select;
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
        Select select,
        Long visitaId,
        Long campoId
) implements Serializable {
}