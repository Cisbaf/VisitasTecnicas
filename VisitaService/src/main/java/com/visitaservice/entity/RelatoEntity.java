package com.visitaservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class RelatoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String autor;
    private String mensagem;
    private String tema;
    private String gestorResponsavel;
    private Date data;
    private Boolean resolvido;
    @ManyToOne
    @JoinColumn(name = "visita_id")
    private VisitaEntity visitas;

}
