package com.viaturaservice.entity.dto;

import com.viaturaservice.entity.api.Preenchimento;

import java.util.List;

public record VeiculoDto(
        String identificacao,
        List<Preenchimento> preenchimentos,
        String km
) {
}
