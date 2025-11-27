package com.avaliacaoservice.inspecao.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CidadeProntidao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String cidade;

    private LocalDate dataEnvio;
    @ElementCollection
    private List<Saidas> saidas;

}

