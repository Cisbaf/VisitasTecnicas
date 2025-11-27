package com.avaliacaoservice.base.service;

import com.avaliacaoservice.base.entity.BaseEntity;
import com.avaliacaoservice.base.entity.BaseRequest;
import com.avaliacaoservice.base.entity.BaseResponse;
import com.avaliacaoservice.base.repository.BaseRepository;
import com.avaliacaoservice.base.service.capsule.BaseService;
import com.avaliacaoservice.viatura.repository.ViaturaRepository;
import com.avaliacaoservice.visita.repository.VisitaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class BaseServiceImp implements BaseService {


    private final BaseRepository baseRepository;
    private final ViaturaRepository viaturaServiceClient;
    private final VisitaRepository visitaServiceClient;

    public BaseResponse createBase(BaseRequest baseRequest) {
        try {
            if (baseRequest == null) {
                throw new IllegalArgumentException("Base cannot be null");
            }
            BaseEntity baseEntity = BaseMapper.toEntity(baseRequest);
            BaseEntity savedEntity = this.baseRepository.save(baseEntity);
            return BaseMapper.toDTO(savedEntity);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }


    public BaseResponse getByName(String name) {
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }

        BaseEntity baseEntity = this.baseRepository.findByNomeContainingIgnoreCase(name.replaceAll("\"([^&]+)\"", ""));

        if (baseEntity == null) {
            log.info("Base not found with name: {}", name);
            return null;
        }

        return BaseMapper.toDTO(baseEntity);
    }


    public BaseResponse getById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return this.baseRepository.findById(id)
                .map(BaseMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Base not found with id: " + id));
    }


    public List<BaseResponse> getAll() {
        return this.baseRepository.findAll().stream().map(BaseMapper::toDTO).collect(Collectors.toList());
    }


    public BaseResponse update(Long id, BaseRequest baseRequest) {
        if (id == null || baseRequest == null) {
            throw new IllegalArgumentException("ID and base cannot be null");
        }
        return this.baseRepository.findById(id)
                .map(existingEntity -> {
                    existingEntity.setNome(baseRequest.nome());

                    existingEntity.setEndereco(baseRequest.endereco());

                    existingEntity.setBairro(baseRequest.bairro());
                    existingEntity.setMunicipio(baseRequest.municipio());
                    existingEntity.setTelefone(baseRequest.telefone());
                    existingEntity.setEmail(baseRequest.email());
                    existingEntity.setTipoBase(baseRequest.tipoBase());
                    BaseEntity updatedEntity = this.baseRepository.save(existingEntity);
                    return BaseMapper.toDTO(updatedEntity);
                }).orElseThrow(() -> new RuntimeException("Base not found with id: " + id));
    }

    public void deleteBase(Long id) {
        if (!this.baseRepository.existsById(id)) {
            throw new RuntimeException("Base not found with id: " + id);
        }
        try {
            this.viaturaServiceClient.deleteById(id);
            this.visitaServiceClient.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Cannot delete base with id " + id + " due to existing references.");
        } finally {
            this.baseRepository.deleteById(id);
        }
    }


    public boolean existsById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return this.baseRepository.existsById(id);
    }
}