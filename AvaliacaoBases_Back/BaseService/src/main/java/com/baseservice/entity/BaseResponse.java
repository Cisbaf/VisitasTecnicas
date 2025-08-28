package com.baseservice.entity;

import lombok.Builder;

import java.io.Serializable;

/**
 * DTO for {@link BaseEntity}
 */
@Builder
public record BaseResponse(Long id, String nome, String endereco, String tipoBase) implements Serializable {
}