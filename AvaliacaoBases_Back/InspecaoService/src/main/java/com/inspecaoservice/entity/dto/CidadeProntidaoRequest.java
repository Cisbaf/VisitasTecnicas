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
public class CidadeProntidaoRequest {
    private String cidade;
    private LocalDate mesAno;
    private String saidaEquipe;
}
