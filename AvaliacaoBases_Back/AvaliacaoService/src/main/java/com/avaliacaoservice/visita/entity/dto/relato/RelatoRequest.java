
package com.avaliacaoservice.visita.entity.dto.relato;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.Date;

@Builder
public record RelatoRequest(
        @NotBlank(message = "O autor do relato é requerido")
        String autor,

        @NotBlank(message = "A mensagem do relato é requerido")
        String mensagem,

        @NotBlank(message = "O tema do relato é requerido")
        String tema,

        @NotNull(message = "É necessario adicionar a data do relato")
        Date data,

        @NotNull
        Long visitaId

) {


}

