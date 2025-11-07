
package com.avaliacaoservice.inspecao.entity.dto;

import lombok.Builder;

@Builder
public record PorcentagemProntTemp(
    String cidade,
    Double prontidao,
    Double tempo
){

}

