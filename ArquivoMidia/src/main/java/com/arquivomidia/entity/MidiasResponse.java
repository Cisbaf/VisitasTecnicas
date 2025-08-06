package com.arquivomidia.entity;

import lombok.Builder;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link MidiasEntity}
 */
@Builder
public record MidiasResponse(Long id, String tipoArquivo, String url, LocalDate dataUpload, Long idVisita,
                             Long idInconformidade) implements Serializable {
}