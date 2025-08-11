package com.viaturaservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class ViaturaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String placa;
    private String modelo;
    private String ano;
    private String tipoViatura;
    private String statusOperacional;
    @Column(name = "id_base")
    private Long idBase;
    @ElementCollection(fetch = FetchType.EAGER)
    private List<Itens> itens;


}
