package com.inspecaoservice.service;

import com.inspecaoservice.entity.Saidas;
import com.inspecaoservice.entity.dto.CidadeProntidaoRequest;
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
import java.util.HashMap;
import java.util.List;

import static com.inspecaoservice.service.Utils.converterMesAno;
import static com.inspecaoservice.service.Utils.converterTimestampExcel;

@Service
@AllArgsConstructor
public class CsvProcessingService {

    private CidadeService cidadeService;

    public void processarArquivoTempos(MultipartFile file) {
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
        } catch (Exception e) {
            e.printStackTrace();
        }

        cidadeService.processarPlanilhaTempos(dados);
    }

    public void processarArquivoVTR(MultipartFile file) {
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
        } catch (Exception e) {
            e.printStackTrace();
        }

        cidadeService.processarPlanilhaTempos(dados);
    }

    public void processarArquivoProntidao(MultipartFile file) {
        List<CidadeProntidaoRequest> dados = new ArrayList<>();

        try (InputStreamReader reader = new InputStreamReader(file.getInputStream())) {
            CSVParser csvParser = CSVParser.parse(reader, CSVFormat.DEFAULT
                    .builder()
                    .setHeader()
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build());

            for (CSVRecord record : csvParser) {
                CidadeProntidaoRequest dto = new CidadeProntidaoRequest();

                dto.setCidade(record.get("\uFEFFCIDADE"));
                dto.setMesAno(converterMesAno(record.get("MÊS/ANO")));

                String saidaEquipe = findSaidaEquipeValue(record).replace(";;;;;;", "").trim();
                dto.setSaidaEquipe(converterTimestampExcel(saidaEquipe));
                dados.add(dto);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        cidadeService.processarPlanilhaProntidao(dados);
    }

    public HashMap<String, String> calcularMediaProntidao() {
        var listaProntidao = cidadeService.getAllCidadesProntidao();
        HashMap<String, String> mapaProntidao = new HashMap<>();

        for (var cidade : listaProntidao) {
            if (cidade.getSaida() != null && !cidade.getSaida().isEmpty()) {
                long totalSegundos = 0;
                int count = 0;

                for (Saidas saida : cidade.getSaida()) {
                    String tempo = saida.saidaEquipe();
                    if (tempo != null && !tempo.isEmpty()) {
                        long segundos = converterTempoParaSegundos(tempo);
                        if (segundos >= 0) {
                            totalSegundos += segundos;
                            count++;
                        }
                    }
                }

                if (count > 0) {
                    long mediaSegundos = totalSegundos / count;
                    String tempoMedio = converterSegundosParaTempo(mediaSegundos);
                    mapaProntidao.put(cidade.getCidade(), tempoMedio);
                } else {
                    mapaProntidao.put(cidade.getCidade(), "00:00:00");
                }
            } else {
                mapaProntidao.put(cidade.getCidade(), "00:00:00");
            }
        }

        return mapaProntidao;
    }


    private long converterTempoParaSegundos(String tempo) {
        try {
            String[] partes = tempo.split(":");
            if (partes.length == 3) {
                long horas = Long.parseLong(partes[0]);
                long minutos = Long.parseLong(partes[1]);
                long segundos = Long.parseLong(partes[2]);
                return horas * 3600 + minutos * 60 + segundos;
            }
        } catch (NumberFormatException e) {
            System.err.println("Formato de tempo inválido: " + tempo);
        }
        return -1;
    }

    private String converterSegundosParaTempo(long totalSegundos) {
        long horas = totalSegundos / 3600;
        long minutos = (totalSegundos % 3600) / 60;
        long segundos = totalSegundos % 60;

        return String.format("%02d:%02d:%02d", horas, minutos, segundos);
    }

    private String findSaidaEquipeValue(CSVRecord record) {
        String[] possibleHeaders = {
                ".Saída da Equipe (prontidão);;;;;;",
                ".Saída da Equipe (prontidão)",
                "Saída da Equipe (prontidão)",
                "Saída da Equipe",
                ".Saída da Equipe"
        };

        for (String header : possibleHeaders) {
            if (record.isMapped(header)) {
                return record.get(header.replace(";;;;;;;", "").trim());
            }
        }

        for (String header : record.toMap().keySet()) {
            if (header.contains("Saída da Equipe") || header.contains("prontidão")) {
                return record.get(header);
            }
        }

        return "";
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