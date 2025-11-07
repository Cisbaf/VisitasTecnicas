package com.avaliacaoservice.form.entity.dto.campos;

import com.avaliacaoservice.form.entity.dto.resposta.RespostaRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record  CamposFormRequest(
        @NotBlank(message = "O titulo do campoId é requerido") String titulo,
        @NotNull(message = "O tipo do campoId é requerido") String tipo,
        Long formId,
        List<RespostaRequest> resposta
) {

}



