package com.inspecaoservice.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

public class Utils {

    private static final Map<String, Integer> MESES = new HashMap<>();

    static {
        MESES.put("jan", 1);
        MESES.put("janeiro", 1);
        MESES.put("fev", 2);
        MESES.put("fevereiro", 2);
        MESES.put("mar", 3);
        MESES.put("março", 3);
        MESES.put("marco", 3);
        MESES.put("abr", 4);
        MESES.put("abril", 4);
        MESES.put("mai", 5);
        MESES.put("maio", 5);
        MESES.put("jun", 6);
        MESES.put("junho", 6);
        MESES.put("jul", 7);
        MESES.put("julho", 7);
        MESES.put("ago", 8);
        MESES.put("agosto", 8);
        MESES.put("set", 9);
        MESES.put("setembro", 9);
        MESES.put("out", 10);
        MESES.put("outubro", 10);
        MESES.put("nov", 11);
        MESES.put("novembro", 11);
        MESES.put("dez", 12);
        MESES.put("dezembro", 12);
    }

    public static LocalDate converterMesAno(String mesAno) {
        // Exemplo: "jan. de 2025"
        String[] partes = mesAno.split(" ");

        // Pega o mês (primeira parte) e remove o ponto
        String mesStr = partes[0].replace(".", "").toLowerCase();

        // Pega o ano (última parte)
        String anoStr = partes[partes.length - 1];

        // Converte
        Integer mes = MESES.get(mesStr);
        if (mes == null) {
            throw new RuntimeException("Mês não reconhecido: " + mesStr);
        }

        int ano = Integer.parseInt(anoStr);

        return LocalDate.of(ano, mes, 1);
    }

    public static String converterTimestampExcel(String timestampExcel) {
        try {
            double value = Double.parseDouble(timestampExcel);

            long totalMillis;

            if (value < 0) {
                throw new IllegalArgumentException("Valor negativo não é suportado: " + value);
            }

            if (value < 1.0) {
                totalMillis = Math.round(value * 24 * 60 * 60 * 1000);
            } else if (value <= 86400.0) {
                totalMillis = Math.round(value * 1000.0);
            } else {
                double frac = value - Math.floor(value);
                totalMillis = Math.round(frac * 24 * 60 * 60 * 1000);
            }

            long horas = totalMillis / 3_600_000L;
            long resto = totalMillis % 3_600_000L;
            long minutos = resto / 60_000L;
            resto = resto % 60_000L;
            long segundos = resto / 1000L;
            long millis = resto % 1000L;

            return String.format("%02d:%02d:%02d", horas, minutos, segundos);

        } catch (NumberFormatException e) {
            throw new RuntimeException("Entrada não é um número válido: " + timestampExcel, e);
        }
    }

}
