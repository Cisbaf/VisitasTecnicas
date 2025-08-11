package com.avaliacaoservice.service;

import com.avaliacaoservice.entity.AvaliacaoEntity;
import com.avaliacaoservice.repository.AvaliacaoRepository;
import com.avaliacaoservice.service.exists.CheckListExists;
import com.avaliacaoservice.service.exists.ViaturaExists;
import com.avaliacaoservice.service.exists.VisitaExists;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public AvaliacaoEntity createAvaliacao(AvaliacaoEntity avaliacao) {
        if (avaliacao == null) {
            throw new IllegalArgumentException("Avaliação não pode ser nula");
        }
        checkExist(avaliacao);

        return avaliacaoRepository.save(avaliacao);
    }

    public List<AvaliacaoEntity> createAll(List<AvaliacaoEntity> avaliacoes) {
        if (avaliacoes == null || avaliacoes.isEmpty()) {
            throw new IllegalArgumentException("Lista de avaliações não pode ser nula ou vazia");
        }
        for (AvaliacaoEntity avaliacao : avaliacoes) {
            checkExist(avaliacao);
        }
        return avaliacaoRepository.saveAll(avaliacoes);
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
        if (avaliacaoRepository.existsByIdVisitaAndIdCheckList(avaliacao.getIdVisita(), avaliacao.getIdCheckList())) {
            throw new IllegalArgumentException("Avaliação já existe para essa visita e checklist: " + avaliacao.getIdVisita() + ", " + avaliacao.getIdCheckList());
        }
    }

    public AvaliacaoEntity updateAvaliacao(Long id, AvaliacaoEntity avaliacao) {
        if (!avaliacaoRepository.existsById(id)) {
            throw new IllegalArgumentException("Avaliação não encontrada com o id: " + id);
        }
        if (!checkListExists.existsCheckListById(avaliacao.getIdCheckList())
                || !viaturaExists.existsViaturaById(avaliacao.getIdViatura())
                || !visitaExists.existsVisitaById(avaliacao.getIdVisita())) {
            throw new IllegalArgumentException("CheckList, Viatura ou Visita não existe");
        }
        avaliacao.setId(id);
        return avaliacaoRepository.save(avaliacao);
    }

    public void deleteAvaliacao(Long id) {
        if (!avaliacaoRepository.existsById(id)) {
            throw new IllegalArgumentException("Avaliação não encontrada com o id: " + id);
        }
        avaliacaoRepository.deleteById(id);
    }
}
