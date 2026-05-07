package com.avaliacaoservice.inspecao.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"cidade", "dataVigencia"}))
public class CidadeTempo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String cidade;
    private LocalDate dataEnvio;
    private LocalDate dataVigencia;

    private String tempoMinimo;
    private String tempoMedio;
    private String tempoMaximo;


}

