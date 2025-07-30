package com.viaturaservice.entity;

import lombok.Data;

import java.io.Serializable;

@Data
public class Itens implements Serializable {
    private String nome;
    private int conformidade;

}
