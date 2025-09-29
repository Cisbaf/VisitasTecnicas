package com.viaturaservice.entity;

import lombok.Builder;

import java.io.Serializable;

@Builder
public record BaseResponse(Long id, String nome) implements Serializable {
}