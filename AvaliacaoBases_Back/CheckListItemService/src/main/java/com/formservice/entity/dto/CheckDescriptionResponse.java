package com.formservice.entity.dto;

import com.formservice.entity.enums.Criticidade;
import com.formservice.entity.enums.TipoConformidade;
import lombok.Builder;

import java.io.Serializable;

@Builder
public record CheckDescriptionResponse(
        Long id,
        String descricao,
        int conformidadePercent,
        String observacao,
        Long visitaId,
        Long viaturaId,
        TipoConformidade tipoConformidade,
        Criticidade criticidade,
        Long checklistId
) implements Serializable {}