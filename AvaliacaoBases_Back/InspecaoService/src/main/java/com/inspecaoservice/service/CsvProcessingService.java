package com.inspecaoservice.service;

import com.inspecaoservice.entity.Saidas;
import com.inspecaoservice.entity.dto.CidadeProntidaoRequest;
import com.inspecaoservice.entity.dto.CidadeTempoDTO;
import com.inspecaoservice.entity.dto.VtrRequest;
import lombok.AllArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
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
            throw new RuntimeException("Erro ao processar arquivo de tempos: " + e.getMessage(), e);
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
            throw new RuntimeException("Erro ao processar arquivo de prontidão: " + e.getMessage(), e);
        }

        cidadeService.processarPlanilhaProntidao(dados);
    }

    public void processarArquivoVTR(MultipartFile file) {
        List<VtrRequest> dados = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);

            // Obter todas as regiões mescladas da planilha
            List<CellRangeAddress> mergedRegions = sheet.getMergedRegions();

            // Processar cabeçalhos
            Row headerRow = sheet.getRow(0);
            int municipioCol = -1, ativaCol = -1, placaCol = -1, cnesCol = -1, viaturaCol = -1;

            for (Cell cell : headerRow) {
                String cellValue = getCellValueAsString(cell).toUpperCase();
                if (cellValue.contains("MUNICÍPIO") || cellValue.contains("MUNICIPIO")) {
                    municipioCol = cell.getColumnIndex();
                } else if (cellValue.contains("ATIVA") && cellValue.contains("%")) {
                    ativaCol = cell.getColumnIndex();
                } else if (cellValue.contains("PLACA")) {
                    placaCol = cell.getColumnIndex();
                } else if (cellValue.contains("CNES")) {
                    cnesCol = cell.getColumnIndex();
                } else if (cellValue.contains("VIATURA")) {
                    viaturaCol = cell.getColumnIndex();
                }
            }

            // Processar dados
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                VtrRequest dto = new VtrRequest();

                if (municipioCol >= 0) {
                    String cidade = getMergedCellValue(sheet, mergedRegions, i, municipioCol);
                    dto.setCidade(cidade);
                }

                if (placaCol >= 0) {
                    String placa = getMergedCellValue(sheet, mergedRegions, i, placaCol);
                    dto.setPlaca(placa);
                }

                if (cnesCol >= 0) {
                    String cnes = getMergedCellValue(sheet, mergedRegions, i, cnesCol);
                    dto.setCNES(cnes);
                }

                if (viaturaCol >= 0) {
                    String viatura = getMergedCellValue(sheet, mergedRegions, i, viaturaCol);
                    dto.setViatura(viatura);
                }

                if (ativaCol >= 0) {
                    String ativaValue = getMergedCellValue(sheet, mergedRegions, i, ativaCol);
                    try {
                        ativaValue = ativaValue.replaceAll("[^0-9.,]", "").replace(",", ".");
                        if (!ativaValue.isEmpty()) {
                            double doubleValue = Double.parseDouble(ativaValue);
                            dto.setAtiva(Math.round(doubleValue));
                        }
                    } catch (NumberFormatException e) {
                        System.err.println("Erro ao converter valor: " + ativaValue);
                    }
                }

                dados.add(dto);
            }
            cidadeService.processarPlanilhaVTR(dados);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar arquivo VTR: " + e.getMessage(), e);
        }
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



    private String getMergedCellValue(Sheet sheet, List<CellRangeAddress> mergedRegions, int row, int col) {
        for (CellRangeAddress mergedRegion : mergedRegions) {
            if (mergedRegion.isInRange(row, col)) {
                Row firstRow = sheet.getRow(mergedRegion.getFirstRow());
                Cell firstCell = firstRow.getCell(mergedRegion.getFirstColumn());
                return getCellValueAsString(firstCell);
            }
        }

        Row currentRow = sheet.getRow(row);
        if (currentRow == null) return "";

        Cell cell = currentRow.getCell(col);
        return getCellValueAsString(cell);
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";

        try {
            switch (cell.getCellType()) {
                case STRING:
                    return cell.getStringCellValue().trim();
                case NUMERIC:
                    if (DateUtil.isCellDateFormatted(cell)) {
                        return cell.getDateCellValue().toString();
                    } else {
                        double value = cell.getNumericCellValue();
                        if (value == Math.floor(value)) {
                            return String.valueOf((long) value);
                        } else {
                            return String.valueOf(value);
                        }
                    }
                case BOOLEAN:
                    return String.valueOf(cell.getBooleanCellValue());
                case FORMULA:
                    try {
                        switch (cell.getCachedFormulaResultType()) {
                            case NUMERIC:
                                double formulaValue = cell.getNumericCellValue();
                                if (formulaValue == Math.floor(formulaValue)) {
                                    return String.valueOf((long) formulaValue);
                                } else {
                                    return String.valueOf(formulaValue);
                                }
                            case STRING:
                                return cell.getStringCellValue().trim();
                            case BOOLEAN:
                                return String.valueOf(cell.getBooleanCellValue());
                            default:
                                return "";
                        }
                    } catch (Exception e) {
                        return cell.getStringCellValue().trim();
                    }
                default:
                    return "";
            }
        } catch (Exception e) {
            System.err.println("Erro ao ler célula: " + e.getMessage());
            return "";
        }
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