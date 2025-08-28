package com.checklistitemservice.entity;

import com.checklistitemservice.entity.enums.Criticidade;
import com.checklistitemservice.entity.enums.TipoConformidade;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CheckDescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String descricao;
    private int conformidadePercent; // Ex: 100% / 50% / 0%
    private String observacao;
    private Long visitaId;
    private Long viaturaId;
    @Enumerated(EnumType.ORDINAL)
    private TipoConformidade tipoConformidade; //  Conforme 1 / Parcial 2 / Não Conforme 0
    @Enumerated(EnumType.ORDINAL)
    private Criticidade criticidade; //  Alta 3 / Média 2 / Baixa 1 / Nenhuma 0

    @ManyToOne
    @JoinColumn(name = "checklist_id")
    private CheckListEntity checklist;
}
