package com.avaliacaoservice.inspecao.service;

import com.avaliacaoservice.inspecao.entity.dto.CidadeProntidaoRequest;
import com.avaliacaoservice.inspecao.entity.dto.CidadeProntidaoResponse;
import com.avaliacaoservice.inspecao.entity.dto.CidadeTempoDTO;
import com.avaliacaoservice.inspecao.entity.dto.VtrRequest;
import jakarta.annotation.Nonnull;
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
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CsvProcessingService {
    private final CidadeService cidadeService;

    public void processarArquivoTempos(MultipartFile file, LocalDate dataVigencia) {
        List<CidadeTempoDTO> dados = new ArrayList<>();

        try (InputStreamReader reader = new InputStreamReader(file.getInputStream())) {
            // Lemos sem definir Header para evitar erro de nomes duplicados
            CSVParser csvParser = CSVParser.parse(reader, CSVFormat.DEFAULT
                    .builder()
                    .setTrim(true)
                    .build());

            boolean isHeader = true;
            for (CSVRecord record : csvParser) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                } // Pula a primeira linha
                if (record.size() < 4) continue;

                CidadeTempoDTO dto = new CidadeTempoDTO();
                // Índice 0: Cidade | 1: Min | 2: Médio | 3: Máximo
                dto.setCidade(record.get(0).replace("\uFEFF", "").trim());
                dto.setTempoMinimo(formatarSegundosDoCsv(record.get(1)));
                dto.setTempoMedio(formatarSegundosDoCsv(record.get(2)));
                dto.setTempoMaximo(formatarSegundosDoCsv(record.get(3)));

                dados.add(dto);
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar tempos: " + e.getMessage());
        }
        this.cidadeService.processarPlanilhaTempos(dados, dataVigencia);
    }


    public void processarArquivoProntidao(MultipartFile file, LocalDate dataVigencia) {
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

                // Busca a cidade tratando o caractere BOM
                String cidade = record.isMapped("CIDADE") ? record.get("CIDADE") :
                        record.isMapped("\uFEFFCIDADE") ? record.get("\uFEFFCIDADE") : "";

                dto.setCidade(cidade.trim());
                dto.setMesAno(dataVigencia);
                dto.setDataVigencia(dataVigencia);

                String saidaRaw = findSaidaEquipeValue(record).replace(";;;;;;", "").trim();
                dto.setSaidaEquipe(formatarSegundosDoCsv(saidaRaw));
                dados.add(dto);
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar prontidão: " + e.getMessage());
        }
        this.cidadeService.processarPlanilhaProntidao(dados);
    }

    public void processarArquivoVTR(MultipartFile file, LocalDate dataVigencia) {
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
                        List<VtrRequest> viaturasDoMunicipio = entry.getValue();


                        // Chamar o service passando as viaturas agrupadas por município
                        this.cidadeService.processarPlanilhaVTR(viaturasDoMunicipio, dataVigencia);
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

    public HashMap<String, String> calcularMediaProntidao(LocalDate mes) {
        List<CidadeProntidaoResponse> listaProntidao = this.cidadeService.getAllCidadesProntidao(mes);

        // Agrupa por cidade e calcula a média dos tempos
        Map<String, Double> mediaPorCidadeEmSegundos = listaProntidao.stream()
                .filter(cidade -> cidade.getSaidaEquipe() != null && !cidade.getSaidaEquipe().isEmpty())
                .collect(Collectors.groupingBy(CidadeProntidaoResponse::getCidade,
                        Collectors.averagingLong(cidade -> {
                            try {
                                // Converte HH:mm:ss para segundos
                                LocalTime time = LocalTime.parse(cidade.getSaidaEquipe());
                                return Duration.between(LocalTime.MIDNIGHT, time).getSeconds();
                            } catch (DateTimeParseException e) {
                                // Logar erro ou retornar 0 para tempos inválidos
                                System.err.println("Erro ao parsear tempo para a cidade " + cidade.getCidade() + ": " + cidade.getSaidaEquipe());
                                return 0L;
                            }
                        })
                ));

        HashMap<String, String> mapaProntidaoFormatado = getStringStringHashMap(mediaPorCidadeEmSegundos);

        // Adiciona cidades que não tinham dados ou tinham dados inválidos com "00:00:00"
        listaProntidao.stream()
                .map(CidadeProntidaoResponse::getCidade)
                .distinct()
                .forEach(cidade -> mapaProntidaoFormatado.putIfAbsent(cidade, "00:00:00"));

        return mapaProntidaoFormatado;
    }

    @Nonnull
    private static HashMap<String, String> getStringStringHashMap(Map<String, Double> mediaPorCidadeEmSegundos) {
        HashMap<String, String> mapaProntidaoFormatado = new HashMap<>();

        // Formata a média de segundos de volta para HH:mm:ss
        for (Map.Entry<String, Double> entry : mediaPorCidadeEmSegundos.entrySet()) {
            String cidade = entry.getKey();
            long mediaSegundos = Math.round(entry.getValue());

            long hours = mediaSegundos / 3600;
            long minutes = (mediaSegundos % 3600) / 60;
            long seconds = mediaSegundos % 60;

            String tempoFormatado = String.format("%02d:%02d:%02d", hours, minutes, seconds);
            mapaProntidaoFormatado.put(cidade, tempoFormatado);
        }
        return mapaProntidaoFormatado;
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
        String[] headers = {".Saída da Equipe (Prontidão)", "Saída da Equipe (Prontidão)", "Saída da Equipe", ".Saída da Equipe"};
        for (String h : headers) {
            if (record.isMapped(h)) return record.get(h);
        }
        return record.toMap().entrySet().stream()
                .filter(e -> e.getKey().contains("Saída") || e.getKey().contains("Prontid"))
                .map(Map.Entry::getValue)
                .findFirst().orElse("0");
    }

    public boolean isArquivoTempos(MultipartFile file) {
        try {
            String firstLine = getFirstLine(file);
            firstLine = firstLine.replace("\uFEFF", "").toUpperCase();

            // Verifica se possui CIDADE e TEMPO RESPOSTA
            return firstLine.contains("CIDADE") && firstLine.contains("TEMPO RESPOSTA");
        } catch (IOException e) {
            return false;
        }
    }

    public boolean isArquivoProntidao(MultipartFile file) {
        try {
            String firstLine = getFirstLine(file);
            firstLine = firstLine.replace("\uFEFF", "");

            return firstLine.toUpperCase().contains("CIDADE") &&
                    (firstLine.toUpperCase().contains("SAÍDA DA EQUIPE") || firstLine.toUpperCase().contains("PRONTIDÃO"));
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

    private String formatarSegundosDoCsv(String valor) {
        if (valor == null || valor.trim().isEmpty()) return "00:00:00";
        try {
            double segundos = Double.parseDouble(valor.trim().replace(",", "."));
            return converterSegundosParaTempo(Math.round(segundos));
        } catch (NumberFormatException e) {
            return "00:00:00";
        }
    }
}