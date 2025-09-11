package com.formservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.formservice.entity.emuns.CheckBox;
import com.formservice.entity.emuns.Select;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.util.Objects;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Resposta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String texto;

    @Enumerated(EnumType.STRING)
    private CheckBox checkbox;

    @Enumerated(EnumType.STRING)
    @Column(name = "select_option")
    private Select select;

    private Long visitaId;

    @ManyToOne(cascade = CascadeType.ALL)
    @JsonIgnore
    private CamposFormEntity campo;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Resposta resposta = (Resposta) o;
        return getId() != null && Objects.equals(getId(), resposta.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
