package com.inspecaoservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@Builder
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CidadeTempo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String cidade;
    private String tempoMinimo;
    private String tempoMedio;
    private String tempoMaximo;
}
