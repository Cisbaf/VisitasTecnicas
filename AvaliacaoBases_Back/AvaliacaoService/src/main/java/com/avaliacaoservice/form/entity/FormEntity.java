package com.avaliacaoservice.form.entity;

import com.avaliacaoservice.form.entity.emuns.TipoForm;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class FormEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String categoria;
    private Long summaryId;
    @OneToMany(mappedBy = "form", cascade = {CascadeType.ALL}, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<CamposFormEntity> campos = new ArrayList<>();
    @Enumerated(EnumType.STRING)
    private TipoForm tipoForm;

}