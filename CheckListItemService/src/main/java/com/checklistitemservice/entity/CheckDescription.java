package com.checklistitemservice.entity;

import com.checklistitemservice.entity.enums.Criticidade;
import com.checklistitemservice.entity.enums.TipoConformidade;
import jakarta.persistence.*;
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
    private String observacao;

    @Enumerated(EnumType.ORDINAL)
    private TipoConformidade tipoConformidade; //  Conforme 1 / Parcial 2 / Não Conforme 0
    @Enumerated(EnumType.ORDINAL)
    private Criticidade criticidade; //  Alta 3 / Média 2 / Baixa 1 / Nenhuma 0

}
