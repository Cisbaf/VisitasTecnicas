package com.formservice.entity.dto;

import lombok.*;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link com.formservice.entity.CheckListEntity}
 */
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CheckListResponse implements Serializable {
    private Long id;
    private String categoria;
    private List<CheckDescriptionResponse> descricao;
}