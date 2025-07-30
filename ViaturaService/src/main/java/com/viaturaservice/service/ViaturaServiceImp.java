package com.viaturaservice.service;

import com.viaturaservice.entity.ViaturaDTO;
import com.viaturaservice.entity.ViaturaEntity;
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

    public ViaturaDTO createViatura(ViaturaDTO viaturaDTO) {
        try{
        ViaturaEntity entity = mapper.toEntity(viaturaDTO);
        ViaturaEntity savedEntity = viaturaRepository.save(entity);
        return toDTO(savedEntity);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Erro ao criar viatura: " + e.getMessage(), e);
        }
    }

    public ViaturaDTO getViaturaById(Long id) {

        return viaturaRepository.findById(id)
                .map(ViaturaMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Viatura não encontrada."));
    }

    public List<ViaturaDTO> getAllViaturas() {
        return viaturaRepository.findAll().stream()
                .map(ViaturaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ViaturaDTO updateViatura(Long id, ViaturaDTO viaturaDTO) {
        ViaturaEntity entity = mapper.toEntity(viaturaDTO);
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
