package com.viaturaservice.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link ViaturaEntity}
 */
@Builder
public record ViaturaRequest(
        @Pattern(regexp = "^[A-Z]{3}\\d{4}$|^[A-Z]{3}\\d[A-Z]\\d{2}$", message = "Placa inválida. Formato esperado: AAA9999 ou AAA9A99") @Length(min = 7, max = 7, message = "A placa deve ter exatamente 7 caracteres") @NotBlank(message = "Campo placa não pode estar vazio") String placa,
        @NotBlank(message = "Campo modelo não pode estar vazio") String modelo,
        @Pattern(regexp = "^\\d{4}$", message = "Ano deve ter 4 dígitos") @NotNull(message = "O campo ano não pode ser vazio") String ano,
        @NotBlank(message = "O tipo de viatura é requerido") String tipoViatura,
        @NotBlank(message = "O status operacional é requerido") String statusOperacional,
        @NotNull(message = "O campo base não pode ser vazio") @Positive(message = "Esta base não existe") Long idBase,
        @NotNull(message = "O campo base não pode ser vazio") List<Itens> itens) implements Serializable {

}