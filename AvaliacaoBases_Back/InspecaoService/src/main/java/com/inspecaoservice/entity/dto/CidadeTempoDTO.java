package com.inspecaoservice.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CidadeTempoDTO {
    private String cidade;
    private String tempoMinimo;
    private String tempoMedio;
    private String tempoMaximo;
}