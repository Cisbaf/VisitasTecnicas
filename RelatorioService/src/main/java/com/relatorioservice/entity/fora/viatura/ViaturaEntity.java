package com.relatorioservice.entity.fora.viatura;

import lombok.*;

import java.util.List;

@Data
@Builder
@ToString
public class ViaturaEntity {

    private Long id;
    private String placa;
    private String modelo;
    private String ano;
    private String tipoViatura;
    private String statusOperacional;
    private Long idBase;
    private List<Itens> itens;

}
