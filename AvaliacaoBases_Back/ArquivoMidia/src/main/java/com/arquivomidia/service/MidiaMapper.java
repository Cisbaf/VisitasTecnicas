package com.arquivomidia.service;

import com.arquivomidia.entity.MidiasEntity;
import com.arquivomidia.entity.MidiasRequest;
import com.arquivomidia.entity.MidiasResponse;
import com.arquivomidia.entity.TipoMidia;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
class MidiaMapper {

    protected static MidiasEntity toEntity(MidiasRequest midia) {
        if (midia == null) {
            return null;
        }
        return MidiasEntity.builder().dataUpload(LocalDate.now()).tipoArquivo(TipoMidia.valueOf(midia.tipoArquivo().toUpperCase())).url(midia.url()).idVisita(midia.idVisita() != null ? midia.idVisita() : null)
                .idInconformidade(midia.idInconformidade() != null ? midia.idInconformidade() : null)
                .build();
    }
    protected static MidiasResponse toResponse(MidiasEntity midia) {
        if (midia == null) {
            return null;
        }
        return new MidiasResponse(
                midia.getId(),
                midia.getTipoArquivo().toString(),
                midia.getUrl(),
                midia.getDataUpload(),
                midia.getIdVisita(),
                midia.getIdInconformidade()
        );
    }
}
