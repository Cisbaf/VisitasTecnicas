package com.avaliacaoservice.viatura.entity.api;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class RegistroApi {
    private Map<String, Cidade> cidades = new HashMap<>();

    @JsonAnySetter
    public void setCidade(String nomeCidade, Cidade cidade) {
        this.cidades.put(nomeCidade, cidade);
    }
}