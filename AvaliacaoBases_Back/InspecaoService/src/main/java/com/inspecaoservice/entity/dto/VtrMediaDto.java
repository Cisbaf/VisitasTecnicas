package com.inspecaoservice.entity.dto;

import lombok.Builder;

@Builder
public record VtrMediaDto(String cidade, double ativa) {

}
