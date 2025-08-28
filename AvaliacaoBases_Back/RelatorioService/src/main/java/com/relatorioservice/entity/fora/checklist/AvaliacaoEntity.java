package com.relatorioservice.entity.fora.checklist;

import lombok.Builder;
import lombok.Data;
import lombok.ToString;

@Data
@Builder
@ToString
public class AvaliacaoEntity {

    private Long id;
    private Long idVisita;
    private Long idCheckList;
    private Long idViatura;
}
