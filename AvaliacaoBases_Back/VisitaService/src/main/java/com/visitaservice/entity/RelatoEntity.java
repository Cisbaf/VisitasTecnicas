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
    private Date data;
    @ManyToOne
    @JoinColumn(name = "visita_id")
    private VisitaEntity visitas;
    private Long baseId;

}
