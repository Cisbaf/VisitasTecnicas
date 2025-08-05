package com.relatorioservice.entity.fora.Visita;

import lombok.Builder;
import lombok.Data;
import lombok.ToString;

import java.util.Date;
import java.util.List;

@Data
@Builder
@ToString
public class VisitaEntity {

    private Long id;
    private Date dataVisita;
    private Long idBase;
    private List<EquipeTecnica> membros;


}
