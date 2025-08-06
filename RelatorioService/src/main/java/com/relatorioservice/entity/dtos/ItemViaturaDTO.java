package com.relatorioservice.entity.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemViaturaDTO {
    private String nome;
    private int conformidade;
}