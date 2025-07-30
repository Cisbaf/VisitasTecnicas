package com.baseservice.service;

import com.baseservice.entity.BaseDTO;
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
    public BaseDTO createBase(BaseDTO baseDTO) {
        try {
            if (baseDTO == null) {
                throw new IllegalArgumentException("Base cannot be null");
            }
            var baseEntity = toEntity(baseDTO);
            var savedEntity = baseRepository.save(baseEntity);
            return toDTO(savedEntity);
        }catch (DataIntegrityViolationException e ){
            throw new IllegalArgumentException(e.getMessage());
        }

    }

    @Override
    public BaseDTO getById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return baseRepository.findById(id)
                .map(BaseMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Base not found with id: " + id));
    }

    @Override
    public List<BaseDTO> getAll() {
        return baseRepository.findAll().stream().map(BaseMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public BaseDTO update(Long id, BaseDTO baseDTO) {
        if (id == null || baseDTO == null) {
            throw new IllegalArgumentException("ID and base cannot be null");
        }
        return baseRepository.findById(id)
                .map(existingEntity -> {
                    existingEntity.setNome(baseDTO.getNome());
                    existingEntity.setEndereco(baseDTO.getEndereco());
                    existingEntity.setTipoBase(baseDTO.getTipoBase());

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
