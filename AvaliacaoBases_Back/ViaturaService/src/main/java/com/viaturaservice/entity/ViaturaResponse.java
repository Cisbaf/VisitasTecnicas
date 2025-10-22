package com.viaturaservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link ViaturaEntity}
 */
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViaturaResponse implements Serializable {
    private Long id;
    private String placa;
    private String km;
    private String tipoViatura;
    private String statusOperacional;
    private Long idBase;
    private String dataInclusao;
    private String dataUltimaAlteracao;
}