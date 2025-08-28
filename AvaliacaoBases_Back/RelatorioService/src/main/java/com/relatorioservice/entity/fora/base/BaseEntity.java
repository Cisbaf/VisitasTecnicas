package com.relatorioservice.entity.fora.base;

import lombok.*;

@Data
@Builder
public class BaseEntity {
    private Long id;
    private String nome;
    private String endereco;
    private String tipoBase;
}
