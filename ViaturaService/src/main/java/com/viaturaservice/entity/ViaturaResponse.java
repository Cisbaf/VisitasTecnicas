package com.viaturaservice.entity;

import lombok.Builder;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link ViaturaEntity}
 */
@Builder
public record ViaturaResponse(Long id, String placa, String modelo, String ano, String tipoViatura, String statusOperacional, Long idBase, List<Itens> itens) implements Serializable {
  }