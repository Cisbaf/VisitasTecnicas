package com.visitaservice.entity.dto.visita;

import com.visitaservice.entity.EquipeTecnica;
import com.visitaservice.entity.VisitaEntity;
import lombok.Builder;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for {@link VisitaEntity}
 */
@Builder
public record VisitaResponse(Long id, LocalDate dataVisita, Long idBase, String tipoVisita,
                             List<EquipeTecnica> membros) implements Serializable {
}