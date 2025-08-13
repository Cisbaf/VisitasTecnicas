package com.avaliacaoservice.service;

import com.avaliacaoservice.entity.AvaliacaoEntity;
import com.avaliacaoservice.entity.AvaliacaoRequest;
import com.avaliacaoservice.repository.AvaliacaoRepository;
import com.avaliacaoservice.service.exists.CheckListExists;
import com.avaliacaoservice.service.exists.ViaturaExists;
import com.avaliacaoservice.service.exists.VisitaExists;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.avaliacaoservice.service.AvaliacaoMapper.toEntity;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {
    private final AvaliacaoRepository avaliacaoRepository;
    private final CheckListExists checkListExists;
    private final VisitaExists visitaExists;
    private final ViaturaExists viaturaExists;

    public AvaliacaoEntity findById(Long id) {
        return avaliacaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Avaliação não encontrada com o id: " + id));
    }

    public List<AvaliacaoEntity> findAll() {
        return avaliacaoRepository.findAll();
    }

    public List<AvaliacaoEntity> findByIdVisita(Long idVisita) {
        try {
            if (!visitaExists.existsVisitaById(idVisita)) {
                throw new IllegalArgumentException("Visita não encontrada com o id: " + idVisita);
            }
            return avaliacaoRepository.findByIdVisita(idVisita);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao verificar a existência da visita: " + e.getMessage());
        }
    }

    public AvaliacaoEntity createAvaliacao(AvaliacaoRequest avaliacao) {
        if (avaliacao == null) {
            throw new IllegalArgumentException("Avaliação não pode ser nula");
        }
        checkExist(toEntity(avaliacao));

        return avaliacaoRepository.save(toEntity(avaliacao));
    }

    public List<AvaliacaoEntity> createAll(List<AvaliacaoRequest> avaliacoes) {
        if (avaliacoes == null || avaliacoes.isEmpty()) {
            throw new IllegalArgumentException("Lista de avaliações não pode ser nula ou vazia");
        }
        for (AvaliacaoRequest avaliacao : avaliacoes) {
            var avaliacaoEntity = toEntity(avaliacao);
            checkExist(avaliacaoEntity);
        }
        return avaliacaoRepository.saveAll(avaliacoes.stream()
                .map(AvaliacaoMapper::toEntity)
                .toList());
    }

    private void checkExist(AvaliacaoEntity avaliacao) {
        if (!checkListExists.existsCheckListById(avaliacao.getIdCheckList())
                || !visitaExists.existsVisitaById(avaliacao.getIdVisita())) {
            throw new IllegalArgumentException("CheckList ou Visita não existe");
        }
        if (avaliacao.getIdViatura() != null){
            if (!viaturaExists.existsViaturaById(avaliacao.getIdViatura())) {
                throw new IllegalArgumentException("Viatura não existe com o id: " + avaliacao.getIdViatura());
            }
        }
        if (avaliacaoRepository.existsByIdVisitaAndIdCheckListAndIdViatura(avaliacao.getIdVisita(), avaliacao.getIdCheckList(), avaliacao.getIdViatura())) {
            throw new IllegalArgumentException("Avaliação já existe para essa visita e checklist: " + avaliacao.getIdVisita() + ", " + avaliacao.getIdCheckList() + ", " + avaliacao.getIdViatura());
        }
    }

    public AvaliacaoEntity updateAvaliacao(Long id, AvaliacaoRequest avaliacao) {
        if (!avaliacaoRepository.existsById(id)) {
            throw new IllegalArgumentException("Avaliação não encontrada com o id: " + id);
        }
        if (!checkListExists.existsCheckListById(avaliacao.idCheckList())
                || !viaturaExists.existsViaturaById(avaliacao.idViatura())
                || !visitaExists.existsVisitaById(avaliacao.idVisita())) {
            throw new IllegalArgumentException("CheckList, Viatura ou Visita não existe");
        }
        if (avaliacaoRepository.existsByIdVisitaAndIdCheckListAndIdViatura(avaliacao.idVisita(), avaliacao.idCheckList(), avaliacao.idViatura())) {
            throw new IllegalArgumentException("Avaliação já existe para essa visita e checklist: " + avaliacao.idVisita() + ", " + avaliacao.idCheckList() + ", " + avaliacao.idViatura());
        }
        AvaliacaoEntity avaliacaoEntity = toEntity(avaliacao);
        avaliacaoEntity.setId(id);
        return avaliacaoRepository.save(avaliacaoEntity);
    }

    public void deleteAvaliacao(Long id) {
        if (!avaliacaoRepository.existsById(id)) {
            throw new IllegalArgumentException("Avaliação não encontrada com o id: " + id);
        }
        avaliacaoRepository.deleteById(id);
    }
}
