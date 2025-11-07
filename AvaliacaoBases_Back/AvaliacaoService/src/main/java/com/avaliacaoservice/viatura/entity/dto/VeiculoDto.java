package com.avaliacaoservice.viatura.entity.dto;

import com.avaliacaoservice.viatura.entity.api.Preenchimento;

import java.util.List;

public record VeiculoDto(

        String identificacao,
        List<Preenchimento> preenchimentos,
        String km
) {

}


