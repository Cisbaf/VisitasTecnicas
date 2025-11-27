package com.avaliacaoservice.relatorio.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ViaturaDTO {
    private String placa;
    private String tipoViatura;
    private String km;
    private String dataUltimaAlteracao;
}

