package com.avaliacaoservice.form.service;

import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.FormEntity;
import com.avaliacaoservice.form.entity.dto.forms.FormRequest;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import com.avaliacaoservice.form.entity.emuns.TipoForm;
import com.avaliacaoservice.form.respository.FormRepository;
import com.avaliacaoservice.form.respository.RespostaRepository;
import com.avaliacaoservice.form.service.capsule.FormService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FormServiceImp implements FormService {
    private final FormMapper mapper;
    private final FormRepository formRepository;

    public FormResponse createForm(FormRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null");
        }

        // VALIDAR SE VISITA_ID EXISTE
        if (request.visitaId() == null) {
            throw new IllegalArgumentException("visitaId é obrigatório");
        }

        FormEntity form = formRepository.save(mapper.toFormEntity(request));
        return mapper.toFromResponse(form);
    }

    public void saveAllForms(List<FormEntity> forms) {
        if (forms == null || forms.isEmpty()) {
            throw new IllegalArgumentException("A lista de formulários não pode ser nula ou vazia");
        }
        formRepository.saveAll(forms);
    }


    public FormResponse getById(Long id) {
        Objects.requireNonNull(mapper);
        return formRepository.findById(id).map(mapper::toFromResponse)
                .orElseThrow(() -> new IllegalArgumentException("Formulario não encontrado com ID: " + id));
    }

    public List<FormResponse> getByVisitaId(Long visitaId) {
        return formRepository.findByVisitaId(visitaId).stream()
                .map(mapper::toFromResponse)
                .collect(Collectors.toList());
    }

    public List<FormResponse> getByVisitaIdAndSummaryId(Long visitaId, Long summaryId) {
        return formRepository.findByVisitaIdAndSummaryId(visitaId, summaryId).stream()
                .map(mapper::toFromResponse)
                .collect(Collectors.toList());
    }


    public List<FormResponse> getAll() {
        Objects.requireNonNull(mapper);
        return formRepository.findAll().stream().map(mapper::toFromResponse)
                .toList();
    }


    public List<FormResponse> getAllByTipo(TipoForm tipoForm) {
        TipoForm tipo = TipoForm.valueOf(String.valueOf(tipoForm));

        Objects.requireNonNull(mapper);
        return formRepository.findByTipoForm(tipo).stream().map(mapper::toFromResponse)
                .toList();
    }


    public FormResponse update(Long id, FormRequest request) {
        try {
            FormEntity form = formRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Formulario não encontrado com ID: " + id));

            // MANTÉM O VISITA_ID EXISTENTE SE NÃO FOR FORNECIDO NO UPDATE
            Long visitaId = request.visitaId() != null ? request.visitaId() : form.getVisitaId();

            List<CamposFormEntity> novosCampos = request.campos().stream()
                    .map(c -> mapper.toCampoEntity(c, form))
                    .toList();

            form.getCampos().clear();
            form.getCampos().addAll(novosCampos);
            form.setSummaryId(request.summaryId() != null ? request.summaryId() : form.getSummaryId());
            form.setCategoria(request.categoria() != null ? request.categoria() : form.getCategoria());
            form.setVisitaId(visitaId); // ← MANTÉM/MODIFICA VISITA_ID
            form.getCampos().forEach(c -> c.setForm(form));

            // DETERMINA TIPO FORM BASEADO NO SUMMARY
            form.setTipoForm(determinarTipoForm(request.summaryId()));

            return mapper.toFromResponse(formRepository.save(form));
        } catch (Exception e) {
            log.error("Erro ao atualizar formulário com ID: {}. Detalhes do erro: {}", id, e.getMessage());
            throw e;
        }
    }

    private TipoForm determinarTipoForm(Long summaryId) {
        if (summaryId == null) return TipoForm.INSPECAO;
        return summaryId == 2L ? TipoForm.PADRONIZACAO : TipoForm.INSPECAO;
    }


    public void deleteForm(Long id) {
        FormEntity form = formRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Formulario não encontrado com ID: " + id));
        formRepository.delete(form);
    }
}