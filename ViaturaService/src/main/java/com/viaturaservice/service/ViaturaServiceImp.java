package com.viaturaservice.service;

import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaEntity;
import com.viaturaservice.entity.ViaturaResponse;
import com.viaturaservice.repository.ViaturaRepository;
import com.viaturaservice.service.capsule.ViaturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.viaturaservice.service.ViaturaMapper.toDTO;

@Service
@RequiredArgsConstructor
public class ViaturaServiceImp implements ViaturaService {
    private final ViaturaRepository viaturaRepository;
    private final ViaturaMapper mapper;

    public ViaturaResponse createViatura(ViaturaRequest viaturaRequest) {
        try{
        ViaturaEntity entity = mapper.toEntity(viaturaRequest);
        ViaturaEntity savedEntity = viaturaRepository.save(entity);
        return toDTO(savedEntity);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Erro ao criar viatura: " + e.getMessage(), e);
        }
    }

    public ViaturaResponse getViaturaById(Long id) {

        return viaturaRepository.findById(id)
                .map(ViaturaMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Viatura não encontrada."));
    }

    @Override
    public boolean existsViaturaById(Long id) {
        return viaturaRepository.existsById(id);
    }

    public List<ViaturaResponse> getAllViaturas() {
        return viaturaRepository.findAll().stream()
                .map(ViaturaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ViaturaResponse updateViatura(Long id, ViaturaRequest viaturaRequest) {
        ViaturaEntity entity = mapper.toEntity(viaturaRequest);
        entity.setId(id);
        ViaturaEntity updatedEntity = viaturaRepository.save(entity);
        return toDTO(updatedEntity);
    }

    public void deleteViatura(Long id) {
        if (!viaturaRepository.existsById(id)) {
            throw new RuntimeException("Viatura não encontrada para exclusão." );
        }
        viaturaRepository.deleteById(id);
    }
}
