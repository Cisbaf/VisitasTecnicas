package com.avaliacaoservice.relatorio.entity;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RelatoDTO {
    private String tema;
    private String mensagem;
}