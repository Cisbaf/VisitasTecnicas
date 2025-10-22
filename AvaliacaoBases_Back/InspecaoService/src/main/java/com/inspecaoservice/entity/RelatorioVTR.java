package com.inspecaoservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class RelatorioVTR {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String cidade;
    private LocalDate dataEnvio;
    @ElementCollection
    private List<VTR> VTR;
}
