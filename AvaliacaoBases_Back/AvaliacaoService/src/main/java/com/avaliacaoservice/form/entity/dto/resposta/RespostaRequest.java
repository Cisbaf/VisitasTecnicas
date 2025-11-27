package com.avaliacaoservice.form.entity.dto.resposta;

import com.avaliacaoservice.form.entity.emuns.CheckBox;
import lombok.Builder;

@Builder
public record RespostaRequest(
        String texto,
        CheckBox checkbox,
        Long campoId
) {

}


