package com.relatorioservice.entity.fora.Visita;

import lombok.Builder;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@ToString
public class VisitaEntity {

    private Long id;
    private LocalDate dataVisita;
    private Long idBase;
    private List<EquipeTecnica> membros;


}
