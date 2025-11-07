
package com.avaliacaoservice.visita.entity.dto.visita;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;


@Builder
public record VisitaResponse(
        Long id,
        LocalDate dataVisita,
        Long idBase,
        String tipoVisita,
        List<EquipeTecnicaResponse> membros
) {


}

