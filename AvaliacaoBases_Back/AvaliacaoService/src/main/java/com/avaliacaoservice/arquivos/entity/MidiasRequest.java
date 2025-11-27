package com.avaliacaoservice.arquivos.entity;

import lombok.Builder;

@Builder
public record MidiasRequest(
        Long idVisita,
        String flag,
        String tipoArquivo
) {

}
