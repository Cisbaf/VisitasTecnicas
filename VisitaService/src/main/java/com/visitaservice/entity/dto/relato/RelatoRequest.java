package com.visitaservice.entity.dto.relato;

import com.visitaservice.entity.VisitaEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.io.Serializable;
import java.util.Date;

/**
 * DTO for {@link com.visitaservice.entity.RelatoEntity}
 */

public record RelatoRequest(
        @NotBlank(message = "O autor do relato é requerido")
        String autor,
        @NotBlank(message = "A mensagem do relato é requerido")
        String mensagem,
        @NotBlank(message = "O tema do relato é requerido")
        String tema,
        @NotBlank(message = "O gestor responsavel pela visita é requerido")
        String gestorResponsavel,
        @NotNull(message = "É necessario adicionar a data do relato")
        Date data,
        @NotNull(message = "Campo não pode ser nulo")
        Boolean resolvido,
        @NotNull
        VisitaEntity visitas
) implements Serializable {}