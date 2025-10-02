package com.baseservice.entity;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
    @NotBlank(message = "Campo bairro é requerido")
    String bairro;
    @NotBlank(message = "Campo municipio é requerido")
    String municipio;
    @NotBlank(message = "Campo telefone é requerido")
    @Pattern(message = "Telefone inválido", regexp = "^\\(?(?:[14689][1-9]|2[12478]|3[1234578]|5[1345]|7[134579])\\)? ?(?:[2-8]|9[0-9])[0-9]{3}-?[0-9]{4}$")
    String telefone;
    @Email(message = "Email inválido")
    @NotBlank(message = "Campo email é requerido")
    String email;
    @NotBlank(message = "Campo tipoBase é requerido")
    String tipoBase;
}