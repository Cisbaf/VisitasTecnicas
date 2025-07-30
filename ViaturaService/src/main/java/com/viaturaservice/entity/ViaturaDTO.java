package com.viaturaservice.entity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ViaturaDTO {

    private String placa;
    private String modelo;
    private String ano;
    private String tipoViatura;
    private String statusOperacional;
    private Long idBase;

}
