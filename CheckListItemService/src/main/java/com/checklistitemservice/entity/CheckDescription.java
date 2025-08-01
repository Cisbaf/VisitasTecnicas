package com.checklistitemservice.entity;

import com.checklistitemservice.entity.enums.TipoConformidade;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CheckDescription {
    private String descricao;
    private int conformidadePercent; // Ex: 100% / 50% / 0%
    @Enumerated(EnumType.ORDINAL)
    private TipoConformidade tipoConformidade; //  Conforme 1 / Parcial 2 / Não Conforme 0
    private String observacao;
}
