package com.avaliacaoservice.arquivos.entity;


import lombok.Builder;

import java.time.LocalDate;

@Builder
public record MidiasResponse(

        Long id,
        String tipoArquivo,
        String base64DataUrl,
        LocalDate dataUpload,
        Long idVisita,
        String flag
) {
}