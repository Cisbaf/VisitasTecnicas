package com.relatorioservice.entity.dtos;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RelatoDTO {
    private String tema;
    private String mensagem;
    private boolean resolvido;
}