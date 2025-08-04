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
    public AvaliacaoEntity createAvaliacao(AvaliacaoEntity avaliacao) {
        if (avaliacao == null) {
            throw new IllegalArgumentException("Avaliação não pode ser nula");
        }
        if (!checkListExists.existsCheckListById(avaliacao.getIdCheckList())
                || !viaturaExists.existsViaturaById(avaliacao.getIdViatura())
                || !visitaExists.existsVisitaById(avaliacao.getIdVisita())) {
            throw new IllegalArgumentException("CheckList, Viatura ou Visita não existe");
        }
        return avaliacaoRepository.save(avaliacao);
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
