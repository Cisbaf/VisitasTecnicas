package com.avaliacaoservice.visita.entity.dto.relato;

import com.avaliacaoservice.visita.entity.dto.visita.VisitaResponse;
import lombok.Builder;

import java.util.Date;

@Builder
public record RelatoResponse(
        Long id,
        String autor,
        String mensagem,
        String tema,
        Date data,
        VisitaResponse visitas,
        Long baseId


) {


}
    