package com.relatorioservice.entity.fora.checklist;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
public class CheckListEntity implements Serializable {
    private Long id;
    private String categoria;
    private List<CheckDescription> descricao;
}