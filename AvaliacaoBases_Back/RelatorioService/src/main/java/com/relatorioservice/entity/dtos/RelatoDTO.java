package com.relatorioservice.entity.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RelatoDTO {
    private String tema;
    private String mensagem;
    private boolean resolvido;
}