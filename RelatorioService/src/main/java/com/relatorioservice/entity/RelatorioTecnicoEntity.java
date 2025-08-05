package com.relatorioservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class RelatorioTecnicoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long visitaId;
    private Date dataVisita;
    private String baseNome;
    private String municipio;
    private List<String> pontosFortes;
    private List<String> pontosCriticos;
    @ElementCollection(fetch = FetchType.EAGER)
    private Map<String, Double> conformidades;
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> viaturas_id;
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> relatos_id;
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> equipe_id;


}
