package com.formservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.formservice.entity.emuns.Tipo;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CamposFormEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Enumerated(EnumType.STRING)
    private Tipo tipo;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "campo", orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Resposta> resposta = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "form_id")
    @JsonIgnore
    private FormEntity form;

    public void setResposta(List<Resposta> novasRespostas) {
        this.resposta.clear();
        if (novasRespostas != null) {
            novasRespostas.forEach(this::addResposta);
        }
    }

    public void addResposta(Resposta r) {
        r.setCampo(this);
        this.resposta.add(r);
    }

    public void removeResposta(Resposta r) {
        r.setCampo(null);
        this.resposta.remove(r);
    }
}
