package com.formservice.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String categoria;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @Builder.Default
    private List<CamposFormEntity> campos = new ArrayList<>();

    public void setCampos(List<CamposFormEntity> novosCampos) {
        if (novosCampos != null) {
            novosCampos.forEach(this::addCampo);
        }
    }

    public void addCampo(CamposFormEntity campo) {
        campo.setForm(this);
        this.campos.add(campo);
    }
}
