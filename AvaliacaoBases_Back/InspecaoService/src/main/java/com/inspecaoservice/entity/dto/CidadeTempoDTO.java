package com.inspecaoservice.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CidadeTempoDTO {
    private String cidade;
    private LocalDate dataEnvio;
    private String tempoMinimo;
    private String tempoMedio;
    private String tempoMaximo;
}