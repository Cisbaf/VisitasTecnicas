package com.visitaservice.entity.dto.visita;

import com.visitaservice.entity.EquipeTecnica;
import com.visitaservice.entity.VisitaEntity;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.ToString;
import lombok.Value;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for {@link VisitaEntity}
 */
@Value
@Builder
@ToString
public class VisitaRequest implements Serializable {
    @NotNull(message = "A data da visita é requerida")
    LocalDate dataVisita;
    @NotNull(message = "A base visitada é requerida")
    @Positive
    Long idBase;
    @NotNull(message = "O tipo da visita é requerido")
    String tipoVisita ;

    List<EquipeTecnica> membros;
    }