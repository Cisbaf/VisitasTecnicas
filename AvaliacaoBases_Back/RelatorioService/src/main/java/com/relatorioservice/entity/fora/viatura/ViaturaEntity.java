package com.relatorioservice.entity.fora.viatura;

import lombok.Builder;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDate;

@Data
@Builder
@ToString
public class ViaturaEntity {

    private Long id;
    private String placa;
    private String km;
    private String tipoViatura;
    private String statusOperacional;
    private Long idBase;
    private LocalDate dataInclusao;
    private String dataUltimaAlteracao;

}
