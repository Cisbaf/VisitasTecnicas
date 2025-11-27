package com.avaliacaoservice.viatura.repository;

import com.avaliacaoservice.viatura.entity.ViaturaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ViaturaRepository extends JpaRepository<ViaturaEntity, Long> {
    List<ViaturaEntity> findAllByIdBase(Long paramLong);

    void deleteAllByIdBase(Long paramLong);

    Optional<ViaturaEntity> findByPlaca(String paramString);
}
