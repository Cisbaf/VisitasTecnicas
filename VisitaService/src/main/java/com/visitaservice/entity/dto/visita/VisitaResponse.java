package com.visitaservice.entity.dto.visita;

import com.visitaservice.entity.EquipeTecnica;
import com.visitaservice.entity.VisitaEntity;
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