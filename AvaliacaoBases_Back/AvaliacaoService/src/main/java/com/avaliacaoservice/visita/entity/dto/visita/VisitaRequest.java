
package com.avaliacaoservice.visita.entity.dto.visita;

import com.avaliacaoservice.visita.entity.EquipeTecnica;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;


@Data
@Builder
public class VisitaRequest {

    @NotNull(message = "A data da visita é requerida")
    private LocalDate dataVisita;

    @NotNull(message = "A base visitada é requerida")

    @Positive
    private Long idBase;

    private java.util.List<EquipeTecnica> membros;

    @NotNull(message = "O tipo da visita é requerido")
    private String tipoVisita;


}

