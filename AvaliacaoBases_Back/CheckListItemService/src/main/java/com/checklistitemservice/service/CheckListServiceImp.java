package com.checklistitemservice.service;

import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
import com.checklistitemservice.respository.CheckDescRepository;
import com.checklistitemservice.respository.CheckListRepository;
import com.checklistitemservice.service.capsule.CheckListService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckListServiceImp implements CheckListService {
    private final CheckListMapper mapper;
    private final CheckListRepository repository;
    private final CheckDescRepository descRepository;
    private final String nullMessage = "CheckList não encontrado com ID: ";


    @Override
    public CheckListResponse createCheckList(CheckListRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("CheckList não pode ser nulo");
        }
        if (repository.existsByCategoria(request.categoria())) {
            throw new IllegalArgumentException("Já existe um CheckList com a categoria: " + request.categoria());
        }
        var entity = mapper.toEntity(request);
        var savedEntity = repository.save(entity);
        return mapper.toResponse(savedEntity);

    }

    @Override
    public List<CheckListResponse> createCheckLists(List<CheckListRequest> requests) {
    if (requests == null || requests.isEmpty()) {
        throw new IllegalArgumentException("Lista de CheckLists não pode ser nula ou vazia");
    }

    try{
        List<CheckListResponse> responses = requests.stream()
                .filter(Objects::nonNull)
                .filter(request -> !repository.existsByCategoria(request.categoria()))
                .map(mapper::toEntity)
                .map(repository::save)
                .map(mapper::toResponse)
                .toList();
        if (responses.isEmpty()) {
            throw new IllegalArgumentException("Nenhum CheckList foi criado, todas as categorias já existem.");
        }
        return  responses;
    }catch (Exception exception) {
        throw new IllegalArgumentException("Erro ao criar CheckLists: " + exception.getMessage());
    }

    }

    @Override
    public CheckListResponse getById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID não pode ser nulo");
        }
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new IllegalArgumentException(nullMessage + id));
    }

    @Override
    public List<CheckListResponse> getAll() {
        return repository.findAll().stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<CheckListResponse> getByVisitaId(Long visitaId) {
        var checkList = descRepository.findAllByVisitaId(visitaId).stream()
                .filter(desc -> desc.getChecklist() != null)
                .map(desc -> repository.findById(desc.getChecklist().getId())
                        .map(mapper::toResponse)
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (checkList.isEmpty()) {
            return new ArrayList<>();
        }
        return checkList;
    }

    @Override
    public CheckListResponse update(Long id, CheckListRequest request) {
    if (id == null || request == null) {
        throw new IllegalArgumentException("ID e CheckList não podem ser nulos");
    }
        var existingEntity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(nullMessage + id));

        var updatedEntity = mapper.toEntity(request);
        updatedEntity.setId(existingEntity.getId());
        var savedEntity = repository.save(updatedEntity);
        return mapper.toResponse(savedEntity);
    }

    @Override
    public void deleteCheckList(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID não pode ser nulo");
        }
        if (!existsById(id)) {
            throw new IllegalArgumentException(nullMessage + id);
        }
        repository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return id != null && repository.existsById(id);
    }
    @Override
    public boolean descriptionExist(Long descriptionId) {
        return descriptionId != null && descRepository.existsById(descriptionId);
    }
}
