package com.avaliacaoservice.inspecao.service;

import com.avaliacaoservice.inspecao.entity.Saidas;
import com.avaliacaoservice.inspecao.entity.dto.CidadeProntidaoRequest;
import com.avaliacaoservice.inspecao.entity.dto.CidadeProntidaoResponse;
import com.avaliacaoservice.inspecao.entity.dto.CidadeTempoDTO;
import com.avaliacaoservice.inspecao.entity.dto.VtrRequest;
import lombok.RequiredArgsConstructor;
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
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CsvProcessingService {
    private final CidadeService cidadeService;

    public void processarArquivoTempos(MultipartFile file) {
        List<CidadeTempoDTO> dados = new ArrayList<>();

        try {
            InputStreamReader reader = new InputStreamReader(file.getInputStream());

            try {
                CSVParser csvParser = CSVParser.parse(reader, CSVFormat.DEFAULT
                        .builder()
                        .setHeader()
                        .setIgnoreHeaderCase(true)
                        .setTrim(true)
                        .build());

                for (CSVRecord record : csvParser) {
                    CidadeTempoDTO dto = new CidadeTempoDTO();
                    dto.setCidade(record.get("﻿CIDADE"));
                    dto.setTempoMinimo(Utils.converterTimestampExcel(record.get("TEMPO MÍNIMO")));
                    dto.setTempoMedio(Utils.converterTimestampExcel(record.get("TEMPO MÉDIO")));
                    dto.setTempoMaximo(Utils.converterTimestampExcel(record.get("TEMPO MÁXIMO")));
                    dados.add(dto);
                }
                reader.close();
            } catch (Throwable throwable) {
                try {
                    reader.close();
                } catch (Throwable throwable1) {
                    throwable.addSuppressed(throwable1);
                }
                throw throwable;
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar arquivo de tempos: " + e.getMessage(), e);
        }


        this.cidadeService.processarPlanilhaTempos(dados);
    }


    public void processarArquivoProntidao(MultipartFile file) {
        List<CidadeProntidaoRequest> dados = new ArrayList<>();

        try {
            InputStreamReader reader = new InputStreamReader(file.getInputStream());
            try {
                CSVParser csvParser = CSVParser.parse(reader, CSVFormat.DEFAULT
                        .builder()
                        .setHeader()
                        .setIgnoreHeaderCase(true)
                        .setTrim(true)
                        .build());

                for (CSVRecord record : csvParser) {
                    CidadeProntidaoRequest dto = new CidadeProntidaoRequest();

                    dto.setCidade(record.get("﻿CIDADE"));
                    dto.setMesAno(Utils.converterMesAno(record.get("MÊS/ANO")));

                    String saidaEquipe = findSaidaEquipeValue(record).replace(";;;;;;", "").trim();
                    dto.setSaidaEquipe(Utils.converterTimestampExcel(saidaEquipe));
                    dados.add(dto);
                }
                reader.close();
            } catch (Throwable throwable) {
                try {
                    reader.close();
                } catch (Throwable throwable1) {
                    throwable.addSuppressed(throwable1);
                }
                throw throwable;
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar arquivo de prontidão: " + e.getMessage(), e);
        }


        this.cidadeService.processarPlanilhaProntidao(dados);
    }

    public void processarArquivoVTR(MultipartFile file) {
        // Map para agrupar viaturas por município
        Map<String, List<VtrRequest>> dadosPorMunicipio = new HashMap<>();

        try {
            InputStream inputStream = file.getInputStream();
            try {
                XSSFWorkbook xSSFWorkbook = new XSSFWorkbook(inputStream);

                try {
                    Sheet sheet = xSSFWorkbook.getSheetAt(0);
                    FormulaEvaluator evaluator = xSSFWorkbook.getCreationHelper().createFormulaEvaluator();
                    List<CellRangeAddress> mergedRegions = sheet.getMergedRegions();

                    Row headerRow = sheet.getRow(0);
                    int municipioCol = -1, ativaCol = -1, placaCol = -1, cnesCol = -1, viaturaCol = -1;

                    // Identificar colunas (seu código atual)
                    for (Cell cell : headerRow) {
                        String cellValue = getCellValueAsString(cell, evaluator).toUpperCase();
                        if (cellValue.contains("MUNICÍPIO") || cellValue.contains("MUNICIPIO")) {
                            municipioCol = cell.getColumnIndex();
                            continue;
                        }
                        if (cellValue.contains("ATIVA") && cellValue.contains("%")) {
                            ativaCol = cell.getColumnIndex();
                            continue;
                        }
                        if (cellValue.contains("PLACA")) {
                            placaCol = cell.getColumnIndex();
                            continue;
                        }
                        if (cellValue.contains("CNES")) {
                            cnesCol = cell.getColumnIndex();
                            continue;
                        }
                        if (cellValue.contains("VIATURA")) {
                            viaturaCol = cell.getColumnIndex();
                        }
                    }
                    // Processar linhas e agrupar por município
                    for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                        Row row = sheet.getRow(i);
                        if (row != null) {
                            VtrRequest dto = new VtrRequest();

                            if (municipioCol >= 0) {
                                String cidade = getMergedCellValue(sheet, mergedRegions, i, municipioCol, evaluator);
                                dto.setCidade(cidade);
                            }

                            if (placaCol >= 0) {
                                String placa = getMergedCellValue(sheet, mergedRegions, i, placaCol, evaluator);
                                dto.setPlaca(placa);
                            }

                            if (cnesCol >= 0) {
                                String cnes = getMergedCellValue(sheet, mergedRegions, i, cnesCol, evaluator);
                                dto.setCNES(cnes);
                            }

                            if (viaturaCol >= 0) {
                                String viatura = getMergedCellValue(sheet, mergedRegions, i, viaturaCol, evaluator);
                                dto.setViatura(viatura);
                            }

                            if (ativaCol >= 0) {
                                Cell ativaCell = getMergedCell(sheet, mergedRegions, i, ativaCol);
                                if (ativaCell != null) {
                                    try {
                                        evaluator.evaluateFormulaCell(ativaCell);
                                        double numericValue = ativaCell.getNumericCellValue();
                                        dto.setAtiva(Math.round(numericValue));
                                    } catch (Exception e) {
                                        try {
                                            String ativaValue = getCellValueAsString(ativaCell, evaluator);
                                            ativaValue = ativaValue.replaceAll("[^0-9.,]", "").replace(",", ".");
                                            if (!ativaValue.isEmpty()) {
                                                double doubleValue = Double.parseDouble(ativaValue);
                                                dto.setAtiva(Math.round(doubleValue));
                                            } else {
                                                dto.setAtiva(0L);
                                            }
                                        } catch (NumberFormatException ex) {
                                            dto.setAtiva(0L);
                                        }
                                    }
                                } else {
                                    dto.setAtiva(0L);
                                }
                            } else {
                                dto.setAtiva(0L);
                            }

                            // Agrupar por município
                            if (dto.getCidade() != null && !dto.getCidade().isEmpty() &&
                                    dto.getViatura() != null && !dto.getViatura().isEmpty()) {

                                dadosPorMunicipio.computeIfAbsent(dto.getCidade(), k -> new ArrayList<>()).add(dto);
                            }
                        }
                    }

                    // Processar cada município com suas viaturas agrupadas
                    for (Map.Entry<String, List<VtrRequest>> entry : dadosPorMunicipio.entrySet()) {
                        String municipio = entry.getKey();
                        List<VtrRequest> viaturasDoMunicipio = entry.getValue();


                        // Chamar o service passando as viaturas agrupadas por município
                        this.cidadeService.processarPlanilhaVTR(viaturasDoMunicipio);
                    }

                    xSSFWorkbook.close();
                } catch (Throwable throwable) {
                    try {
                        xSSFWorkbook.close();
                    } catch (Throwable throwable1) {
                        throwable.addSuppressed(throwable1);
                    }
                    throw throwable;
                }
                inputStream.close();
            } catch (Throwable throwable) {
                try {
                    inputStream.close();
                } catch (Throwable throwable1) {
                    throwable.addSuppressed(throwable1);
                }
                throw throwable;
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar arquivo VTR: " + e.getMessage(), e);
        }
    }

    public HashMap<String, String> calcularMediaProntidao() {
        List<CidadeProntidaoResponse> listaProntidao = this.cidadeService.getAllCidadesProntidao();
        HashMap<String, String> mapaProntidao = new HashMap<>();

        for (CidadeProntidaoResponse cidade : listaProntidao) {
            if (cidade.getSaida() != null && !cidade.getSaida().isEmpty()) {
                long totalSegundos = 0L;
                int count = 0;

                for (Saidas saida : cidade.getSaida()) {
                    String tempo = saida.saidaEquipe();
                    if (tempo != null && !tempo.isEmpty()) {
                        long segundos = converterTempoParaSegundos(tempo);
                        if (segundos >= 0L) {
                            totalSegundos += segundos;
                            count++;
                        }
                    }
                }

                if (count > 0) {
                    long mediaSegundos = totalSegundos / count;
                    String tempoMedio = converterSegundosParaTempo(mediaSegundos);
                    mapaProntidao.put(cidade.getCidade(), tempoMedio);
                    continue;
                }
                mapaProntidao.put(cidade.getCidade(), "00:00:00");
                continue;
            }
            mapaProntidao.put(cidade.getCidade(), "00:00:00");
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
                return horas * 3600L + minutos * 60L + segundos;
            }
        } catch (NumberFormatException e) {
            System.err.println("Formato de tempo inválido: " + tempo);
        }
        return -1L;
    }

    private Cell getMergedCell(Sheet sheet, List<CellRangeAddress> mergedRegions, int row, int col) {
        for (CellRangeAddress mergedRegion : mergedRegions) {
            if (mergedRegion.isInRange(row, col)) {
                Row firstRow = sheet.getRow(mergedRegion.getFirstRow());
                if (firstRow != null) {
                    return firstRow.getCell(mergedRegion.getFirstColumn());
                }
            }
        }

        Row currentRow = sheet.getRow(row);
        if (currentRow == null) return null;

        return currentRow.getCell(col);
    }

    private String getMergedCellValue(Sheet sheet, List<CellRangeAddress> mergedRegions, int row, int col, FormulaEvaluator evaluator) {
        for (CellRangeAddress mergedRegion : mergedRegions) {
            if (mergedRegion.isInRange(row, col)) {
                Row firstRow = sheet.getRow(mergedRegion.getFirstRow());
                Cell firstCell = firstRow.getCell(mergedRegion.getFirstColumn());
                return getCellValueAsString(firstCell, evaluator);
            }
        }

        Row currentRow = sheet.getRow(row);
        if (currentRow == null) return "";

        Cell cell = currentRow.getCell(col);
        return getCellValueAsString(cell, evaluator);
    }

    private String getCellValueAsString(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null) return "";
        try {
            switch (cell.getCellType()) {
                case STRING:
                    return cell.getStringCellValue().trim();
                case NUMERIC:
                    if (DateUtil.isCellDateFormatted(cell)) {
                        return cell.getDateCellValue().toString();
                    }
                    double value = cell.getNumericCellValue();
                    if (value == Math.floor(value)) {
                        return String.valueOf((long) value);
                    }
                    return String.valueOf(value);
                case BOOLEAN:
                    return String.valueOf(cell.getBooleanCellValue());
                case FORMULA:
                    // Avaliar a fórmula
                    try {
                        CellValue cellValue = evaluator.evaluate(cell);
                        switch (cellValue.getCellType()) {
                            case NUMERIC:
                                double numericValue = cellValue.getNumberValue();
                                if (numericValue == Math.floor(numericValue)) {
                                    return String.valueOf((long) numericValue);
                                }
                                return String.valueOf(numericValue);
                            case STRING:
                                return cellValue.getStringValue();
                            case BOOLEAN:
                                return String.valueOf(cellValue.getBooleanValue());
                            case ERROR:
                                return "#ERRO";
                            default:
                                return "";
                        }
                    } catch (Exception e) {
                        return cell.getCellFormula();
                    }
                case ERROR:
                    return "#ERRO";
                default:
                    return "";
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao ler valor da célula: " + e.getMessage(), e);
        }
    }

    private String converterSegundosParaTempo(long totalSegundos) {
        long horas = totalSegundos / 3600L;
        long minutos = totalSegundos % 3600L / 60L;
        long segundos = totalSegundos % 60L;

        return String.format("%02d:%02d:%02d", horas, minutos, segundos);
    }

    private String findSaidaEquipeValue(CSVRecord record) {
        String[] possibleHeaders = {".Saída da Equipe (prontidão);;;;;;", ".Saída da Equipe (prontidão)", "Saída da Equipe (prontidão)", "Saída da Equipe", ".Saída da Equipe"};


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
            firstLine = firstLine.replace("﻿", "");
            return (firstLine.contains("TEMPO MÁXIMO") && firstLine
                    .contains("TEMPO MÉDIO") && firstLine
                    .contains("TEMPO MÍNIMO"));
        } catch (IOException e) {
            return false;
        }
    }

    public boolean isArquivoProntidao(MultipartFile file) {
        try {
            String firstLine = getFirstLine(file);
            firstLine = firstLine.replace("﻿", "");
            return (firstLine.contains("Saída da Equipe") && firstLine
                    .contains("MÊS/ANO"));
        } catch (IOException e) {
            return false;
        }
    }

    private String getFirstLine(MultipartFile file) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        try {
            String str = reader.readLine();
            reader.close();
            return str;
        } catch (Throwable throwable) {
            try {
                reader.close();
            } catch (Throwable throwable1) {
                throwable.addSuppressed(throwable1);
            }
            throw throwable;
        }
    }
}