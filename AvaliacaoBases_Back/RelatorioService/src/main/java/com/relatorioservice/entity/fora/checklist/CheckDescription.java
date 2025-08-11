package com.relatorioservice.entity.fora.checklist;

import com.relatorioservice.entity.fora.checklist.enums.Criticidade;
import com.relatorioservice.entity.fora.checklist.enums.TipoConformidade;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckDescription {
    private String descricao;
    private int conformidadePercent;
    private String observacao;
    private TipoConformidade tipoConformidade;
    private Criticidade criticidade;

}
