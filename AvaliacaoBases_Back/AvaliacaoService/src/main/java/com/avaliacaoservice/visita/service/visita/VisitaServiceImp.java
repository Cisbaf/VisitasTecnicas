package com.avaliacaoservice.visita.service.visita;


import com.avaliacaoservice.base.service.capsule.BaseService;
import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.FormEntity;
import com.avaliacaoservice.form.entity.emuns.Tipo;
import com.avaliacaoservice.form.entity.emuns.TipoForm;
import com.avaliacaoservice.form.service.capsule.FormService;
import com.avaliacaoservice.visita.entity.EquipeTecnica;
import com.avaliacaoservice.visita.entity.VisitaEntity;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaRequest;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaResponse;
import com.avaliacaoservice.visita.repository.VisitaRepository;
import com.avaliacaoservice.visita.service.capsule.VisitaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class VisitaServiceImp implements VisitaService {
    private final VisitaRepository visitaRepository;
    private final BaseService exists;
    private final FormService formService;
    private final VisitaMapper mapper;

    @Override
    public VisitaResponse createVisita(VisitaRequest paramVisitaRequest) {
        var visita = VisitaMapper.toResponse(visitaRepository.save(mapper.toEntity(paramVisitaRequest)));
        if (visita.tipoVisita().equals("Inspeção")) {
            formService.saveAllForms(newForms(visita.id()));
        }
        return visita;
    }


    public VisitaResponse addMembroToVisita(Long visitaId, EquipeTecnica membro) {

        VisitaEntity visita = visitaRepository.findById(visitaId).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com esse id: " + visitaId));

        membro.setVisita(visita);

        visita.getMembros().add(membro);

        visitaRepository.save(visita);

        return VisitaMapper.toResponse(visita);

    }

    public VisitaResponse removeMembroFromVisita(Long visitaId, EquipeTecnica membro) {

        VisitaEntity visita = visitaRepository.findById(visitaId).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com esse id: " + visitaId));

        visita.getMembros().removeIf(Old -> Old.getNome().equals(membro.getNome()) && Old.getCargo().equals(membro.getCargo()));

        visitaRepository.save(visita);

        return VisitaMapper.toResponse(visita);
    }


    public VisitaResponse getById(Long id) {

        VisitaEntity visit = visitaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com esse id: " + id));

        return VisitaMapper.toResponse(visit);

    }


    public List<VisitaResponse> getAll() {

        return visitaRepository.findAll().stream().map(VisitaMapper::toResponse).toList();

    }


    public List<VisitaResponse> getBaseByPeriod(Long idBase, LocalDate dataInicio, LocalDate dataFim) {

        if (exists.existsById(idBase)) {

            return visitaRepository.findAllByIdBaseAndDataVisitaBetween(idBase, dataInicio, dataFim).stream().map(VisitaMapper::toResponse).toList();

        }

        throw new IllegalArgumentException("Base não existe: " + idBase);

    }


    public List<VisitaResponse> getAllByPeriod(LocalDate dataInicio, LocalDate dataFim) {

        try {

            return visitaRepository.getByDataVisitaBetween(dataInicio, dataFim).stream().map(VisitaMapper::toResponse).toList();

        } catch (Exception e) {

            throw new IllegalArgumentException("Erro ao buscar visitas no período: " + e.getMessage());

        }

    }


    public List<EquipeTecnica> getAllMembrosByVisitaId(Long visitaId) {

        return visitaRepository.findById(visitaId).map(VisitaEntity::getMembros).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com esse id: " + visitaId));

    }


    public VisitaResponse updateVisita(Long id, VisitaRequest request) {

        if (existsVisitaById(id)) {


            VisitaEntity existingVisit = visitaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com esse id: " + id));
            existingVisit.setIdBase(request.getIdBase());

            existingVisit.setDataVisita(request.getDataVisita());

            existingVisit.setTipoVisita(request.getTipoVisita());

            updateMembros(existingVisit, request.getMembros());

            VisitaEntity updatedVisit = visitaRepository.save(existingVisit);

            return VisitaMapper.toResponse(updatedVisit);

        }

        throw new IllegalArgumentException("Visita não encontrada com esse id: " + request);

    }

    private void updateMembros(VisitaEntity visita, List<EquipeTecnica> novosMembros) {
        // Clear existing members and add all new ones
        visita.getMembros().clear();

        for (EquipeTecnica membro : novosMembros) {
            membro.setVisita(visita); // Set the bidirectional relationship
            visita.getMembros().add(membro);
        }
    }


    @Transactional
    public void delete(Long id) {

        if (existsVisitaById(id)) {

            visitaRepository.deleteById(id);

        } else {
            throw new IllegalArgumentException("Visita não encontrada com esse id: " + id);

        }

    }


    @Transactional
    public void deleteAllByBaseId(Long idBase) {

        if (exists.existsById(idBase)) {

            List<VisitaEntity> visitas = visitaRepository.findVisitaEntitiesByIdBase(idBase);

            visitas.forEach(visita -> formService.deleteForm(visita.getId()));

            visitaRepository.deleteAll(visitas);

        } else {

            throw new IllegalArgumentException("Base não existe: " + idBase);

        }

    }


    public Boolean existsVisitaById(Long id) {

        return visitaRepository.existsById(id);

    }


    public List<VisitaResponse> getVisitaByIdBase(Long idBase) {

        if (exists.existsById(idBase)) {

            return visitaRepository.findVisitaEntitiesByIdBase(idBase).stream().map(VisitaMapper::toResponse).toList();

        }

        throw new IllegalArgumentException("Base não existe: " + idBase);

    }

    private List<FormEntity> newForms(Long visitaId) {
        List<FormEntity> forms = new ArrayList<>();

        // --- I - MANUTENÇÃO DA PADRONIZAÇÃO DA ESTRUTURA FÍSICA DA BASE DESCENTRALIZADA ---

        var formSecaoI_Ambulancias = FormEntity.builder()
                .visitaId(visitaId)
                .tipoForm(TipoForm.INSPECAO)
                .categoria("AMBULÂNCIAS")
                .summaryId(1L)
                .build();

        // 2.1 - AMBULÂNCIAS (Estrutura física)

        List<String> camposSecaoI = List.of(
                "Sala de repouso para descanso dos profissionais",
                "Banheiro, com chuveiro",
                "Sala de Estar",
                "Copa (pode ser conjugada ao estar)",
                "Estacionamento coberto para Unidade Móvel",
                "Local de limpeza das ambulâncias*",
                "Espaço com tanque para limpeza de materiais como pranchas longas, colete imobilizador e talas de imobilização.",
                "Piso impermeável com escoamento para calha coletora",
                "Prever leve inclinação da ambulância para facilitar a limpeza interna",
                "Sala de recepção e limpeza (Sala de utilidades/expurgo)*",
                "Central de Material Esterilizado (CME)*",
                "Depósito de material de limpeza (DML)*",
                "Almoxarifado*",
                "Área para armazenagem e controle - CAF (Distribuição de Medicamentos)*",
                "Local para armazenamento de resíduos sólidos*"
        );

        for (String titulo : camposSecaoI) {
            var campo = CamposFormEntity.builder().form(formSecaoI_Ambulancias).titulo(titulo).tipo(Tipo.CHECKBOX).build();
            formSecaoI_Ambulancias.getCampos().add(campo);
        }
        forms.add(formSecaoI_Ambulancias);

        // --- II - PADRONIZAÇÃO VISUAL DOS UNIFORMES DAS EQUIPES E DA BASE DESCENTRALIZADA ---

        var formSecaoII_UniformeEquipes = FormEntity.builder()
                .visitaId(visitaId)
                .tipoForm(TipoForm.PADRONIZACAO)
                .categoria("UNIFORME DAS EQUIPES")
                .summaryId(2L)
                .build();

        // 2.1.1 - AMBULÂNCIAS (Uniforme)
        List<String> camposSecaoII_Uniforme = List.of(
                "Macacão no Padrão SAMU 192",
                "Marca SAMU 192 bordada frente e verso",
                "Categoria Profissional bordada frente e verso",
                "Tarja refletiva: tronco, braços e pernas",
                "Nome do profissional com tipo sanguíneo na frente",
                "Camisete interna no Padrão SAMU 192 nas cores branca ou azul",
                "Boné padrão SAMU 192",
                "Bota cano longo"
        );

        // Adiciona todos os campos ao FormEntity da Seção II - UNIFORME DAS EQUIPES
        for (String titulo : camposSecaoII_Uniforme) {
            var campo = CamposFormEntity.builder().form(formSecaoII_UniformeEquipes).titulo(titulo).tipo(Tipo.CHECKBOX).build();
            formSecaoII_UniformeEquipes.getCampos().add(campo);
        }
        forms.add(formSecaoII_UniformeEquipes);

        var formSecaoII_PadronizacaoVisual = FormEntity.builder()
                .visitaId(visitaId)
                .tipoForm(TipoForm.PADRONIZACAO)
                .categoria("PADRONIZAÇÃO VISUAL")
                .summaryId(2L)
                .build();

        // 2.2.1 - AMBULÂNCIAS (Padronização Visual)
        List<String> camposSecaoII_Visual = List.of(
                "Pintura de acordo com o padrão SAMU 192",
                "Sinalização de entrada e saída de unidades Móveis",
                "Placas Internas de sinalização das salas",
                "Padronização visual da viatura",
                "Placa de padronização externa"
        );

        for (String titulo : camposSecaoII_Visual) {
            var campo = CamposFormEntity.builder().form(formSecaoII_PadronizacaoVisual).titulo(titulo).tipo(Tipo.CHECKBOX).build();
            formSecaoII_PadronizacaoVisual.getCampos().add(campo);
        }
        forms.add(formSecaoII_PadronizacaoVisual);

        // --- III - CONDIÇÕES DE FUNCIONAMENTO DO SERVIÇO ---

        var formSecaoIII_Funcionamento = FormEntity.builder()
                .visitaId(visitaId)
                .tipoForm(TipoForm.INSPECAO)
                .categoria("FUNCIONAMENTO DO SERVIÇO")
                .summaryId(4L)
                .build();

        List<String> camposSecaoIII = List.of(
                "Numero de profissionais tripulando as unidades móveis está de acordo com o Preconizado pela Portaria GM/MS n 1.010 de 21 de maio de 2012",
                "A comunicação entre as Bases descentralizadas a Central de Regulação de Urgência e Emergência da Baixada Fluminense está em pleno funcionamento",
                "Possui escala dos profissionais em exercício nas Unidades Móveis do SAMU 192 afixada e visível.",
                "As Unidades Móveis existentes na base descentralizadas estão seguradas contra sinistro.",
                "Existe contrato de manutenção efetiva preventiva e corretiva dos equipamentos médicos e Unidades Móveis",
                "O SAMU 192 possui Grade de referência das Urgências atualizada",
                "Esta sendo feita Educação permanente dos profissionais em exercício nas Unidades Móveis do SAMU 192",
                "Tronco 192 em funcionamento e atendido pela Central de Regulação das Urgências"
        );

        for (String titulo : camposSecaoIII) {
            var campo = CamposFormEntity.builder().form(formSecaoIII_Funcionamento).titulo(titulo).tipo(Tipo.CHECKBOX).build();
            formSecaoIII_Funcionamento.getCampos().add(campo);
        }
        forms.add(formSecaoIII_Funcionamento);


// 4.1 - UNIDADE DE SUPORTE BÁSICO - USB (AMBULÂNCIA)
        var formSecaoIV_USB = FormEntity.builder()
                .visitaId(visitaId)
                .tipoForm(TipoForm.INSPECAO)
                .categoria("UNIDADE DE SUPORTE BÁSICO - USB")
                .summaryId(5L)
                .build();

        List<String> camposSecaoIV_USB = List.of(
                "Giroflex",
                "Sinalização luminosa externa (luzes laterais e traseiras)",
                "Sinalização de embarque e desembarque (porta lateral e traseira)",
                "Sinalização de cena (lado do motorista e as duas dianteiras)",
                "Luzes de strobo de led localizadas nos faróis dianteiros",
                "Sirene",
                "Tomada tripolar externa com extensão*",
                "Cabo de força*",
                "Ar condicionado funcionando",
                "Iluminação interna",
                "Maca",
                "Cadeira de rodas",
                "03 extintores de pó químico",
                "Cone de sinalização (03)",
                "Cilindros: Oxigenação e Ar comprimido",
                "Cilindro portátil de oxigênio (manômetro e fluxômetro com máscara e chicote de oxigenação)",
                "Régua com fluxometros, umidificador de oxigênio e vidro para aspiração.",
                "Aspirador de secreção portátil",
                "Glicosímetro",
                "Lancetas para glicemia capilar",
                "Fitas para glicemia capilar",
                "Óculos de proteção individual",
                "Esfignomanômetro adulto e infantil e estetoscópio adulto e infantil",
                "Oxímetro de pulso, com sensor adulto, pediátrico e neonatal",
                "DEA funcionando e os eletrodos adulto e infantil",
                "Mochila de vias aéreas (ressuscitador manual adulto, infantil e neonatal com máscaras e reservatórios; Cânulas de Guedel tamanhos; 1, 2, 3, 4 e 5,)",
                "Mochila de acesso venoso (agulhas, seringas, cateter venoso periférico, etc..)",
                "Kit para Parto ou materiais necessários para o procedimento",
                "Prancha longa com tirante comum ou aranha.",
                "Protetor lateral de cabeça (coxins/head block), base e tirante para cabeça e queixo.",
                "Colete para imobilização sentado tipo KED adulto e infantil",
                "Talas rígidas e moldáveis para imobilização, tamanhos diversos até 1,20m.",
                "Colar cervical PP, P, M, G , GG, Infantil ou regulável",
                "Caixa de perfuro cortante",
                "Insumos",
                "Mochila de medicação"
        );

        for (String titulo : camposSecaoIV_USB) {
            var campo = CamposFormEntity.builder().form(formSecaoIV_USB).titulo(titulo).tipo(Tipo.CHECKBOX).build();
            formSecaoIV_USB.getCampos().add(campo);
        }
        forms.add(formSecaoIV_USB);

        // 4.2 - UNIDADE DE SUPORTE AVANÇADO - USA (AMBULÂNCIA)
        var formSecaoIV_USA = FormEntity.builder()
                .visitaId(visitaId)
                .tipoForm(TipoForm.INSPECAO)
                .categoria("UNIDADE DE SUPORTE AVANÇADO - USA")
                .summaryId(5L)
                .build();

        List<String> camposSecaoIV_USA = List.of(
                "Giroflex",
                "Sinalização luminosa externa (luzes laterais e traseiras)",
                "Sinalização de embarque e desembarque (porta lateral e traseira)",
                "Sinalização de cena (lado do motorista e as duas dianteiras)",
                "Luzes de strobo de led localizadas nos faróis dianteiros",
                "Sirene",
                "Tomada tripolar externa com extensão*",
                "Cabo de força*",
                "Ar condicionado funcionando",
                "Iluminação interna",
                "Maca",
                "Cadeira de rodas",
                "03 extintores de pó químico",
                "Cone de sinalização (03)",
                "Cilindros: Oxigenação e Ar comprimido",
                "Cilindro portátil de oxigênio (manômetro e fluxômetro com máscara e chicote de oxigenação)",
                "Régua contendo: fluxômetro, umidificador de oxigênio e vidro para aspiração, localizados junto a régua.",
                "Aspirador de secreção portátil",
                "Oxímetro de pulso",
                "Glicosímetro",
                "Lancetas para glicemia capilar",
                "Fitas para glicemia capilar",
                "Esfignomanômetro adulto e infantil e estetoscópio adulto e infantil",
                "Lanterna clínica",
                "Óculos de proteção individual",
                "Monitor/desfibrilador/cardioversor e marcapasso transcutâneo",
                "Eletrodos autoadesivos para desfibrilador adulto",
                "Eletrodos autoadesivos para desfibrilador infantil",
                "Gel para desfibrilação",
                "Eletrodos autoadesivos para ECG",
                "Ventilador mecânico e circuito completo",
                "Bomba de infusão",
                "Mochila de vias aéreas (ressuscitador manual adulto, infantil e neonatal, Kit laringo adulto e infantil; Cânulas de guedel tamanhos: 1, 2, 3, 4 e 5; Cânulas de intubação tamanhos: 2,0, 2,5,0 3,0, 3,5, 4,0, 4,5, 5,0, 5,5, 6,0, 6,5, 7,0, 7,5, 8,0, 8,5; Fixador de tubo adulto e infantil; Fio guia)",
                "Mochila de acesso venoso (agulhas, seringas, cateter venoso periférico, etc..)",
                "Mochila de Medicação",
                "Prancha longa com tirante comum ou aranha.",
                "Protetor lateral de cabeça (coxins/head block), base e tirante para cabeça e queixo.",
                "Colete para imobilização sentado tipo KED adulto e infantil",
                "Talas para imobilização tamanhos diversos até 1,20m.",
                "Colar cervical PP, P, M, G , GG, Infantil ou regulável",
                "Kit para pequena cirurgia ou materiais necessários para o procedimento",
                "Kit para Parto ou materiais necessários para o procedimento",
                "Caixa de perfuro cortante",
                "Insumos"
        );

        for (String titulo : camposSecaoIV_USA) {
            var campo = CamposFormEntity.builder().form(formSecaoIV_USA).titulo(titulo).tipo(Tipo.CHECKBOX).build();
            formSecaoIV_USA.getCampos().add(campo);
        }
        forms.add(formSecaoIV_USA);

        return forms;
    }
}