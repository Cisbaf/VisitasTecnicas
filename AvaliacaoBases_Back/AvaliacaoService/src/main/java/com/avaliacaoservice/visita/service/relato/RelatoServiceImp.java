package com.avaliacaoservice.visita.service.relato;

import com.avaliacaoservice.visita.entity.RelatoEntity;
import com.avaliacaoservice.visita.entity.VisitaEntity;
import com.avaliacaoservice.visita.entity.dto.relato.RelatoRequest;
import com.avaliacaoservice.visita.entity.dto.relato.RelatoResponse;
import com.avaliacaoservice.visita.repository.RelatoRepository;
import com.avaliacaoservice.visita.repository.VisitaRepository;
import com.avaliacaoservice.visita.service.capsule.RelatoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RelatoServiceImp implements RelatoService {
    private final RelatoRepository repository;
    private final RelatoMapper mapper;
    private final String RELATO_NOT_FOUND = "Relato não encontrado com o id: ";
    private final VisitaRepository visitaRepository;

    public RelatoResponse createRelato(RelatoRequest request) {

        RelatoEntity entity = this.mapper.toEntity(request);

        entity.setBaseId(entity.getVisitas().getIdBase());

        log.info("Salvando relato: {}", entity);

        RelatoEntity savedEntity = this.repository.save(entity);
        log.info("Relato salvo com sucesso: {}", savedEntity);

        return RelatoMapper.toResponse(savedEntity);
    }

    public RelatoResponse getById(Long id) {

        return this.repository.findById(id)
                .map(RelatoMapper::toResponse)
                .orElseThrow(() -> new IllegalArgumentException(RELATO_NOT_FOUND + id));
    }

    public List<RelatoResponse> getAll() {
        var relatos = this.repository.findAll();
        System.out.println(relatos.size());
        return relatos.stream()
                .map(RelatoMapper::toResponse)
                .toList();
    }

    public List<RelatoResponse> getAllByVisitaId(Long visitasId) {

        VisitaEntity visista = this.visitaRepository.findById(visitasId).orElseThrow(() -> new IllegalArgumentException(RELATO_NOT_FOUND + visitasId));


        return this.repository.findAllByVisitas(visista).stream()
                .map(RelatoMapper::toResponse)
                .toList();
    }


    public List<RelatoResponse> getAllByBaseId(Long baseId) {

        return this.repository.findAllByBaseId(baseId).stream()
                .map(RelatoMapper::toResponse)
                .toList();
    }

    public RelatoResponse updateRelato(Long id, RelatoRequest request) {

        if (!this.repository.existsById(id)) {

            throw new IllegalArgumentException(RELATO_NOT_FOUND + id);
        }

        RelatoEntity entity = this.repository.findById(id).orElseThrow();

        BeanUtils.copyProperties(request, entity, "id");

        RelatoEntity updatedEntity = this.repository.save(entity);

        return RelatoMapper.toResponse(updatedEntity);
    }

    public void delete(Long id) {

        if (!this.repository.existsById(id)) {
            throw new IllegalArgumentException(RELATO_NOT_FOUND + id);
        }

        this.repository.deleteById(id);
    }
}