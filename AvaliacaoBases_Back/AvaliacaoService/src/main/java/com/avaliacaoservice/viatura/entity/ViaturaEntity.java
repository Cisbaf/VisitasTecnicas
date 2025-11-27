package com.avaliacaoservice.viatura.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ViaturaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String placa;
    private String km;
    private String tipoViatura;
    private String statusOperacional;
    @Column(name = "id_base")
    private Long idBase;
    private LocalDate dataInclusao;
    private String dataUltimaAlteracao;

}

