package com.arquivomidia.entity;

import lombok.Builder;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link MidiasEntity}
 */
@Builder
public record MidiasResponse(
        Long id,
        String tipoArquivo,
        String base64DataUrl,
        LocalDate dataUpload,
        Long idVisita,
        Long idCategoria,
        String flag
) implements Serializable {
}