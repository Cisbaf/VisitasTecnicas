package com.avaliacaoservice.viatura.service;

import com.avaliacaoservice.base.entity.BaseResponse;
import com.avaliacaoservice.base.service.capsule.BaseService;
import com.avaliacaoservice.viatura.entity.ViaturaEntity;
import com.avaliacaoservice.viatura.entity.api.Cidade;
import com.avaliacaoservice.viatura.entity.api.RegistroApi;
import com.avaliacaoservice.viatura.entity.api.Veiculo;
import com.avaliacaoservice.viatura.repository.ViaturaRepository;
import com.avaliacaoservice.viatura.service.capsule.RegistroApiService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ViaturaUpdateService {

    private final RegistroApiService registroApiService;

    private final ViaturaRepository viaturaRepository;
    private final BaseService baseRepository;

    @Scheduled(fixedRate = 87000000L, initialDelay = 10000L)
    @Transactional
    public void atualizarViaturasDiariamente() {
        log.info("Iniciando atualização diária de viaturas...");

        try {
            RegistroApi registros = this.registroApiService.getRegistros();

            if (registros != null && registros.getCidades() != null) {
                for (Map.Entry<String, Cidade> cidadeEntry : registros.getCidades().entrySet()) {
                    String nomeCidade = cidadeEntry.getKey();
                    Cidade cidade = cidadeEntry.getValue();

                    processarViaturasDaCidade(nomeCidade, cidade);
                }
                log.info("Atualização de viaturas concluída com sucesso!");
            } else {
                log.warn("Nenhum dado retornado da API");
            }

        } catch (Exception e) {
            log.error("Erro durante a atualização de viaturas: {}", e.getMessage(), e);
        }
    }

    private void processarViaturasDaCidade(String nomeCidade, Cidade cidade) {
        log.info("Processando viaturas da cidade: {}", nomeCidade);


        BaseResponse base = obterOuCriarBase(nomeCidade);

        if (cidade.getVeiculos() != null) {
            for (Map.Entry<String, Veiculo> veiculoEntry : cidade.getVeiculos().entrySet()) {
                String placa = veiculoEntry.getKey();
                Veiculo veiculoApi = veiculoEntry.getValue();

                processarViaturaIndividual(placa, veiculoApi, base);
            }
        }
    }

    private BaseResponse obterOuCriarBase(String nomeCidade) {
        return this.baseRepository.getByName(nomeCidade.trim());
    }

    private void processarViaturaIndividual(String placa, Veiculo veiculoApi, BaseResponse base) {
        Optional<ViaturaEntity> viaturaExistente = this.viaturaRepository.findByPlaca(placa);

        if (viaturaExistente.isPresent()) {

            atualizarViaturaExistente(viaturaExistente.get(), veiculoApi, base);
        } else {

            criarNovaViatura(placa, veiculoApi, base);
        }
    }

    private void atualizarViaturaExistente(ViaturaEntity viatura, Veiculo veiculoApi, BaseResponse base) {
        boolean houveAlteracao = false;


        if (!viatura.getTipoViatura().equals(veiculoApi.getIdentificacao())) {
            viatura.setTipoViatura(veiculoApi.getIdentificacao());
            houveAlteracao = true;
        }


        if (!viatura.getIdBase().equals(base.id())) {
            viatura.setIdBase(base.id());
            houveAlteracao = true;
        }


        if ((veiculoApi.getKM() != null && !veiculoApi.getKM().equals("Não encontrado!")) || !Objects.equals(viatura.getKm(), veiculoApi.getKM())) {

            assert veiculoApi.getKM() != null;
            String kmAtual = veiculoApi.getKM().replaceAll("\\D", "");
            kmAtual = (kmAtual.startsWith("0") || kmAtual.isEmpty()) ? "0" : kmAtual;
            if (!kmAtual.equals(viatura.getDataUltimaAlteracao())) {
                viatura.setKm(kmAtual);
                houveAlteracao = true;
            }
        }


        if (houveAlteracao) {
            viatura.setDataUltimaAlteracao((veiculoApi.getPreenchimentos() != null && !veiculoApi.getPreenchimentos().isEmpty()) ? veiculoApi.getPreenchimentos().getFirst().getDia() :
                    null);
            this.viaturaRepository.save(viatura);
            log.info("Viatura atualizada: {}", viatura.getPlaca());
        }
    }

    private void criarNovaViatura(String placa, Veiculo veiculoApi, BaseResponse base) {
        if (base == null) {
            log.warn("Base não encontrada para a cidade associada à viatura com placa: {}. Viatura não será criada.", placa);

            return;
        }

        String ultimaAlteracao = (veiculoApi.getPreenchimentos() != null && !veiculoApi.getPreenchimentos().isEmpty()) ? veiculoApi.getPreenchimentos().getLast().getDia() : null;
        String km = veiculoApi.getKM().equals("Não encontrado!") ? "0" : veiculoApi.getKM().replaceAll("\\D", "");


        ViaturaEntity novaViatura = ViaturaEntity.builder().placa(placa).tipoViatura(veiculoApi.getIdentificacao()).statusOperacional(!veiculoApi.getPreenchimentos().isEmpty() ? "Operacional" : "Indefinido").idBase(base.id()).km((km.startsWith("0") || km.isEmpty()) ? "0" : km).dataInclusao(LocalDate.now()).dataUltimaAlteracao(ultimaAlteracao).build();

        this.viaturaRepository.save(novaViatura);
        log.info("Nova viatura criada: {}", placa);
    }
}