package com.relatorioservice.entity.fora.Visita;

import lombok.*;

import java.util.Date;

@Data
@ToString
@Builder
public class RelatoEntity {

    private Long id;
    private String autor;
    private String mensagem;
    private String tema;
    private String gestorResponsavel;
    private Date data;
    private Boolean resolvido;
    private VisitaEntity visitas;

}
