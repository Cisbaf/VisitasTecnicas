package com.checklistitemservice.entity.dto;

import com.checklistitemservice.entity.enums.Criticidade;
import com.checklistitemservice.entity.enums.TipoConformidade;
import lombok.Builder;

import java.io.Serializable;

@Builder
public record CheckDescriptionResponse(
        Long id,
        String descricao,
        int conformidadePercent,
        String observacao,
        Long visitaId,
        TipoConformidade tipoConformidade,
        Criticidade criticidade,
        Long checklistId
) implements Serializable {}