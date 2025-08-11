package com.baseservice.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link BaseEntity}
 */
@Value
@Builder
public class BaseRequest implements Serializable {
    @NotBlank(message = "Campo nome é requerido")
    String nome;
    @NotBlank(message = "Campo endereço é requerido")
    String endereco;
    @NotEmpty
    String tipoBase;
}