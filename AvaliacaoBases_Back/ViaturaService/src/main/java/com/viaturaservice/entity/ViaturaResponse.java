package com.viaturaservice.entity;

import lombok.Builder;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for {@link ViaturaEntity}
 */
@Builder
public record ViaturaResponse(
        Long id,
        String placa,
        String km,
        String tipoViatura,
        String statusOperacional,
        Long idBase,
        List<Itens> itens,
        LocalDate dataInclusao,
        String dataUltimaAlteracao
) implements Serializable {
}