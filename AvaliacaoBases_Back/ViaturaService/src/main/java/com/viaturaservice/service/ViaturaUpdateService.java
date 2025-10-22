package com.viaturaservice.service;

import com.viaturaservice.entity.BaseResponse;
import com.viaturaservice.entity.ViaturaEntity;
import com.viaturaservice.entity.api.Cidade;
import com.viaturaservice.entity.api.RegistroApi;
import com.viaturaservice.entity.api.Veiculo;
import com.viaturaservice.repository.ViaturaRepository;
import com.viaturaservice.service.capsule.RegistroApiService;
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
@RequiredArgsConstructor
@Slf4j
public class ViaturaUpdateService {

    private final RegistroApiService registroApiService;
    private final ViaturaRepository viaturaRepository;
    private final BaseService baseRepository; // Para relacionar com a base/cidade

    @Scheduled(fixedRate = 87000000 ,  initialDelay = 10000) // a cada 24 horas e 10 minutos
    @Transactional
    public void atualizarViaturasDiariamente() {
        log.info("Iniciando atualização diária de viaturas...");

        try {
            RegistroApi registros = registroApiService.getRegistros();

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

        // Buscar ou criar a base (cidade)
        var base = obterOuCriarBase(nomeCidade);

        if (cidade.getVeiculos() != null) {
            for (Map.Entry<String, Veiculo> veiculoEntry : cidade.getVeiculos().entrySet()) {
                String placa = veiculoEntry.getKey();
                Veiculo veiculoApi = veiculoEntry.getValue();

                processarViaturaIndividual(placa, veiculoApi, base);
            }
        }
    }

    private BaseResponse obterOuCriarBase(String nomeCidade) {
        var base = baseRepository.getByName(nomeCidade.trim());
        return base.orElse(null);
    }

    private void processarViaturaIndividual(String placa, Veiculo veiculoApi, BaseResponse base) {
        Optional<ViaturaEntity> viaturaExistente = viaturaRepository.findByPlaca((placa));

        if (viaturaExistente.isPresent()) {
            // UPDATE da viatura existente
            atualizarViaturaExistente(viaturaExistente.get(), veiculoApi, base);
        } else {
            // CREATE nova viatura
            criarNovaViatura(placa, veiculoApi, base);
        }
    }

    private void atualizarViaturaExistente(ViaturaEntity viatura, Veiculo veiculoApi, BaseResponse base) {
        boolean houveAlteracao = false;

        // Verificar se houve mudanças na identificação
        if (!viatura.getTipoViatura().equals(veiculoApi.getIdentificacao())) {
            viatura.setTipoViatura(veiculoApi.getIdentificacao());
            houveAlteracao = true;
        }

        // Verificar se houve mudança na base
        if (!viatura.getIdBase().equals(base.id())) {
            viatura.setIdBase(base.id());
            houveAlteracao = true;
        }

        // Atualizar KM se disponível
        if (veiculoApi.getKM() != null && !veiculoApi.getKM().equals("Não encontrado!") || !Objects.equals(viatura.getKm(), veiculoApi.getKM())) {

            assert veiculoApi.getKM() != null;
            String kmAtual = veiculoApi.getKM().replaceAll("\\D", "");
            kmAtual = kmAtual.startsWith("0" ) || kmAtual.isEmpty() ?  "0" : kmAtual;
            if (!kmAtual.equals(viatura.getDataUltimaAlteracao())) {
                viatura.setKm(kmAtual);
                houveAlteracao = true;
            }
        }

        // Se houve alteração, atualizar data de modificação
        if (houveAlteracao) {
            viatura.setDataUltimaAlteracao(veiculoApi.getPreenchimentos() != null && !veiculoApi.getPreenchimentos().isEmpty()
                    ? veiculoApi.getPreenchimentos().getFirst().getDia()
                    : null);
            viaturaRepository.save(viatura);
            log.info("Viatura atualizada: {}", viatura.getPlaca());
        }
    }

    private void criarNovaViatura(String placa, Veiculo veiculoApi, BaseResponse base) {
        if (base == null) {
            log.warn("Base não encontrada para a cidade associada à viatura com placa: {}. Viatura não será criada.", placa);
            return;
        }
        var ultimaAlteracao = veiculoApi.getPreenchimentos() != null && !veiculoApi.getPreenchimentos().isEmpty()
                ? veiculoApi.getPreenchimentos().getLast().getDia()
                : null;
        var km = veiculoApi.getKM().equals("Não encontrado!") ? "0" : veiculoApi.getKM().replaceAll("\\D", "");
        ViaturaEntity novaViatura = ViaturaEntity.builder()
                .placa(placa)
                .tipoViatura(veiculoApi.getIdentificacao())
                .statusOperacional(!veiculoApi.getPreenchimentos().isEmpty() ? "Operacional" : "Indefinido")
                .idBase(base.id())
                .km(km.startsWith("0") || km.isEmpty() ? "0" : km)
                .dataInclusao(LocalDate.now())
                .dataUltimaAlteracao(ultimaAlteracao)
                .build();

        viaturaRepository.save(novaViatura);
        log.info("Nova viatura criada: {}", placa);
    }
}