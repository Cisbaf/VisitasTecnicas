package com.viaturaservice.entity.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class Veiculo {
    @JsonProperty("Identificação no sistema")
    private String identificacao;

    @JsonProperty("Preenchimentos")
    private List<Preenchimento> Preenchimentos;

    @JsonProperty("KM")
    private String KM;


}