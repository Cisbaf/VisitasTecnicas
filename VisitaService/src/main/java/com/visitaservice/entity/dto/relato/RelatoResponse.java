package com.visitaservice.entity.dto.relato;

import com.visitaservice.entity.VisitaEntity;
import lombok.Builder;

import java.io.Serializable;
import java.util.Date;

/**
 * DTO for {@link com.visitaservice.entity.RelatoEntity}
 */
@Builder
public record RelatoResponse(
        Long id,
        String autor,
        String mensagem,
        String tema,
        String gestorResponsavel,
        Date data,
        Boolean resolvido, VisitaEntity visitas
) implements Serializable {}