package com.avaliacaoservice.base.entity;

import lombok.Builder;

@Builder
public record BaseResponse(

        Long id,
        String nome,
        String endereco,
        String bairro,
        String municipio,
        String telefone,
        String email,
        String tipoBase
) {
}
    