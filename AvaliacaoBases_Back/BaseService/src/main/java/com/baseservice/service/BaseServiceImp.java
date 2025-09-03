package com.baseservice.service;

import com.baseservice.entity.BaseRequest;
import com.baseservice.entity.BaseResponse;
import com.baseservice.repository.BaseRepository;
import com.baseservice.service.capsule.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.baseservice.service.BaseMapper.toDTO;
import static com.baseservice.service.BaseMapper.toEntity;

@Service
@RequiredArgsConstructor
public class BaseServiceImp implements BaseService {
    private final BaseRepository baseRepository;

    @Override
    public BaseResponse createBase(BaseRequest baseRequest) {
        try {
            if (baseRequest == null) {
                throw new IllegalArgumentException("Base cannot be null");
            }
            var baseEntity = toEntity(baseRequest);
            var savedEntity = baseRepository.save(baseEntity);
            return toDTO(savedEntity);
        }catch (DataIntegrityViolationException e ){
            throw new IllegalArgumentException(e.getMessage());
        }

    }

    @Override
    public BaseResponse getById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return baseRepository.findById(id)
                .map(BaseMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Base not found with id: " + id));
    }

    @Override
    public List<BaseResponse> getAll() {
        return baseRepository.findAll().stream().map(BaseMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public BaseResponse update(Long id, BaseRequest baseRequest) {
        if (id == null || baseRequest == null) {
            throw new IllegalArgumentException("ID and base cannot be null");
        }
        return baseRepository.findById(id)
                .map(existingEntity -> {
                    existingEntity.setNome(baseRequest.getNome());
                    existingEntity.setEndereco(baseRequest.getEndereco());
                    existingEntity.setBairro(baseRequest.getBairro());
                    existingEntity.setMunicipio(baseRequest.getMunicipio());
                    existingEntity.setTelefone(baseRequest.getTelefone());
                    existingEntity.setEmail(baseRequest.getEmail());
                    existingEntity.setTipoBase(baseRequest.getTipoBase());

                    var updatedEntity = baseRepository.save(existingEntity);
                    return toDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Base not found with id: " + id));
    }

    public void deleteBase(Long id) {
        if (!baseRepository.existsById(id)) {
            throw new RuntimeException("Base not found with id: " + id);
        }
        baseRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return baseRepository.existsById(id);
    }

}
