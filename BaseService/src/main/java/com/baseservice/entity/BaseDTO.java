package com.baseservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@Data
@Builder
public class BaseDTO {

    private String nome;
    private String endereco;
    private String tipoBase;
}
