package com.avaliacaoservice.arquivos.repository;

import com.avaliacaoservice.arquivos.entity.MidiasEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MidiasRepository extends JpaRepository<MidiasEntity, Long> {
    List<MidiasEntity> findByIdVisita(Long paramLong);
}
