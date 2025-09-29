package com.viaturaservice.repository;

import com.viaturaservice.entity.ViaturaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ViaturaRepository extends JpaRepository<ViaturaEntity, Long> {
    List<ViaturaEntity> findAllByIdBase(Long idBase);

    void deleteAllByIdBase(Long idBase);

    Optional<ViaturaEntity> findByPlaca(String placa);
}
