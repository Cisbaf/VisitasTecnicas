package com.visitaservice.entity;

import lombok.Builder;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * DTO for {@link VisitaEntity}
 */
@Builder
public record VisitaResponse(Long id, Date dataVisita, Long idBase,
                             List<EquipeTecnica> membros) implements Serializable {
}