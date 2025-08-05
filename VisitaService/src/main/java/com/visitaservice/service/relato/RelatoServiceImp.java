package com.visitaservice.service.relato;

import com.visitaservice.entity.RelatoEntity;
import com.visitaservice.entity.dto.relato.RelatoRequest;
import com.visitaservice.entity.dto.relato.RelatoResponse;
import com.visitaservice.repository.RelatoRepository;
import com.visitaservice.repository.VisitaRepository;
import com.visitaservice.service.capsule.RelatoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.visitaservice.service.relato.RelatoMapper.toResponse;

@Service
@RequiredArgsConstructor
public class RelatoServiceImp implements RelatoService {
    private final RelatoRepository repository;
    private final RelatoMapper mapper;
    private final String RELATO_NOT_FOUND = "Relato não encontrado com o id: ";
    private final VisitaRepository visitaRepository;

    public RelatoResponse createRelato(RelatoRequest request) {
        RelatoEntity entity = mapper.toEntity(request);
        RelatoEntity savedEntity = repository.save(entity);
        return toResponse(savedEntity);
    }

    public RelatoResponse getById(Long id) {
        return repository.findById(id)
                .map(RelatoMapper::toResponse)
                .orElseThrow(() -> new IllegalArgumentException(RELATO_NOT_FOUND + id));
    }
    public List<RelatoResponse> getAll() {
        return repository.findAll().stream()
                .map(RelatoMapper::toResponse)
                .toList();
    }
    public List<RelatoResponse> getAllByVisitaId(Long visitasId) {
        var visista = visitaRepository.findById(visitasId).orElseThrow(() -> new IllegalArgumentException(RELATO_NOT_FOUND + visitasId));

        return repository.findAllByVisitas(visista).stream()
                .map(RelatoMapper::toResponse)
                .toList();
    }

    public RelatoResponse updateRelato( Long id, RelatoRequest request) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException(RELATO_NOT_FOUND + id);
        }
        RelatoEntity entity = repository.findById(id).orElseThrow();
        BeanUtils.copyProperties(request, entity, "id");
        RelatoEntity updatedEntity = repository.save(entity);
        return toResponse(updatedEntity);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException(RELATO_NOT_FOUND + id);
        }
        repository.deleteById(id);
    }
}
