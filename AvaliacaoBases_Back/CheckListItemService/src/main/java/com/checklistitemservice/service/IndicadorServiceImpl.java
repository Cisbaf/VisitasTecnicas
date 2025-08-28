package com.checklistitemservice.service;

import com.checklistitemservice.entity.dto.IndicadorRequest;
import com.checklistitemservice.entity.dto.IndicadorResponse;
import com.checklistitemservice.respository.IndicadorRepository;
import com.checklistitemservice.service.capsule.IndicadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IndicadorServiceImpl implements IndicadorService {
    private final IndicadorRepository indicadorRepository;
    private final IndicadorMapper indicadorMapper;

    public IndicadorResponse getById(Long id) {
        return indicadorRepository.findById(id)
                .map(indicadorMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Indicador not found with id: " + id));
    }

    public List<IndicadorResponse> getAll() {
        return indicadorRepository.findAll().stream()
                .map(indicadorMapper::toResponse)
                .toList();
    }

    public IndicadorResponse save(IndicadorRequest request) {
        var entity = indicadorMapper.toEntity(request);
        var savedEntity = indicadorRepository.save(entity);
        return indicadorMapper.toResponse(savedEntity);
    }

    public IndicadorResponse update(Long id, IndicadorRequest request) {
        if (!indicadorRepository.existsById(id)) {
            throw new RuntimeException("Indicador not found with id: " + id);
        }
        var entity = indicadorMapper.toEntity(request);
        entity.setId(id);
        var updatedEntity = indicadorRepository.save(entity);
        return indicadorMapper.toResponse(updatedEntity);
    }

    public void delete(Long id) {
        if (!indicadorRepository.existsById(id)) {
            throw new RuntimeException("Indicador not found with id: " + id);
        }
        indicadorRepository.deleteById(id);
    }

}
