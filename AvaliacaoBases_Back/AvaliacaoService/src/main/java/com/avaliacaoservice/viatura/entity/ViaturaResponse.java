package com.avaliacaoservice.viatura.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ViaturaResponse {
    private Long id;
    private String placa;
    private String km;
    private String tipoViatura;
    private String statusOperacional;
    private Long idBase;
    private String dataInclusao;
    private String dataUltimaAlteracao;


}