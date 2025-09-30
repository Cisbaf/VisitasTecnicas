package com.inspecaoservice.service;

import com.inspecaoservice.entity.dto.CidadeProntidaoDTO;
import com.inspecaoservice.entity.dto.CidadeTempoDTO;
import lombok.AllArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import static com.inspecaoservice.service.Utils.converterMesAno;
import static com.inspecaoservice.service.Utils.converterTimestampExcel;

@Service
@AllArgsConstructor
public class CsvProcessingService {

    private CidadeService cidadeService;

    public void processarArquivoTempos(MultipartFile file) throws IOException {
        List<CidadeTempoDTO> dados = new ArrayList<>();

        try (InputStreamReader reader = new InputStreamReader(file.getInputStream())) {

            CSVParser csvParser = CSVParser.parse(reader, CSVFormat.DEFAULT
                    .builder()
                    .setHeader()
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build());

            for (CSVRecord record : csvParser) {
                CidadeTempoDTO dto = new CidadeTempoDTO();
                dto.setCidade(record.get("\uFEFFCIDADE"));
                dto.setTempoMinimo(converterTimestampExcel(record.get("TEMPO MÍNIMO")));
                dto.setTempoMedio(converterTimestampExcel(record.get("TEMPO MÉDIO")));
                dto.setTempoMaximo(converterTimestampExcel(record.get("TEMPO MÁXIMO")));
                dados.add(dto);
            }
        }

        cidadeService.processarPlanilhaTempos(dados);
    }

    public void processarArquivoProntidao(MultipartFile file) throws IOException {
        List<CidadeProntidaoDTO> dados = new ArrayList<>();

        try (InputStreamReader reader = new InputStreamReader(file.getInputStream())) {
            CSVParser csvParser = CSVParser.parse(reader, CSVFormat.DEFAULT
                    .builder()
                    .setHeader()
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build());

            for (CSVRecord record : csvParser) {
                CidadeProntidaoDTO dto = new CidadeProntidaoDTO();

                dto.setCidade(record.get("\uFEFFCIDADE"));
                dto.setMesAno(converterMesAno(record.get("MÊS/ANO")));

                // Trata a coluna que pode ter nome diferente
                String saidaEquipe = record.isMapped(".Saída da Equipe (prontidão)") ?
                        record.get(".Saída da Equipe (prontidão)") :
                        record.get("Saída da Equipe (prontidão)");

                dto.setSaidaEquipe(converterTimestampExcel(saidaEquipe));
                dados.add(dto);
            }
        }

        cidadeService.processarPlanilhaProntidao(dados);
    }

    public boolean isArquivoTempos(MultipartFile file) {
        try {
            String firstLine = getFirstLine(file);
            firstLine = firstLine.replace("\uFEFF", "");
            return firstLine.contains("TEMPO MÁXIMO") &&
                    firstLine.contains("TEMPO MÉDIO") &&
                    firstLine.contains("TEMPO MÍNIMO");
        } catch (IOException e) {
            return false;
        }
    }

    public boolean isArquivoProntidao(MultipartFile file) {
        try {
            String firstLine = getFirstLine(file);
            firstLine = firstLine.replace("\uFEFF", "");
            return firstLine.contains("Saída da Equipe") &&
                    firstLine.contains("MÊS/ANO");
        } catch (IOException e) {
            return false;
        }
    }

    private String getFirstLine(MultipartFile file) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            return reader.readLine();
        }
    }
}