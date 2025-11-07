package com.avaliacaoservice.viatura.entity.api;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class Cidade {
    private Map<String, Veiculo> veiculos = new HashMap<>();

    @JsonAnySetter
    public void setVeiculo(String placa, Veiculo veiculo) {
        this.veiculos.put(placa, veiculo);
    }
}