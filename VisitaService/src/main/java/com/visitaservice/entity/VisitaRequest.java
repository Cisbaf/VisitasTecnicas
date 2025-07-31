package com.visitaservice.entity;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Value;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * DTO for {@link VisitaEntity}
 */
@Value
@Builder
public class VisitaRequest implements Serializable {
    @NotNull(message = "A data da visita é requerida")
    Date dataVisita;
    @NotNull(message = "A base visitada é requerida")
    @Positive
    Long idBase;
    @NotNull
    List<EquipeTecnica> membros;
}