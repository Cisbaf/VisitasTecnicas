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
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"cidade", "dataVigencia"}))
public class RelatorioVTR {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String cidade;


    private LocalDate dataEnvio;
    private LocalDate dataVigencia;

    @ElementCollection
    private List<VTR> VTR;


}


