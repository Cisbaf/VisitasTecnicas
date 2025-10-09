package com.inspecaoservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Builder
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CidadeProntidao {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String cidade;

    @ElementCollection
    private List<Saidas> saidas;

}
