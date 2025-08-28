package com.relatorioservice.entity.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViaturaDTO {
    private String placa;
    private String modelo;
    private String status;
    private List<ItemViaturaDTO> itensCriticos;
}
