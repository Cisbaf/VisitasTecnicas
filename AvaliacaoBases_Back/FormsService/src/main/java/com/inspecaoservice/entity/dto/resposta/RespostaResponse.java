package com.inspecaoservice.entity.dto.resposta;

import com.inspecaoservice.entity.Resposta;
import com.inspecaoservice.entity.emuns.CheckBox;
import com.inspecaoservice.entity.emuns.Select;
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