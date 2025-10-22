package com.relatorioservice.entity.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViaturaDTO {
    private String placa;
    private String tipoViatura;
    private String km;
    private String dataUltimaAlteracao;
}
