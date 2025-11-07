
package com.avaliacaoservice.visita.entity.dto.visita;

import lombok.Builder;


@Builder
public record EquipeTecnicaResponse(
        Long id,
        String nome,
        String cargo,
        String tipoVisita,
        Long visitaId
) {


}

