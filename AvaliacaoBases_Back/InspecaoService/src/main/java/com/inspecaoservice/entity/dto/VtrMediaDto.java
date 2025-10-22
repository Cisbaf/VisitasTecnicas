package com.inspecaoservice.entity.dto;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record VtrMediaDto(String cidade, double ativa, LocalDate dataEnvio) {

}
