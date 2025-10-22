package com.inspecaoservice.entity.dto;

import com.inspecaoservice.entity.Saidas;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class CidadeProntidaoResponse {
    private String cidade;
    private LocalDate dataEnvio;
    private List<Saidas> saida;
}
