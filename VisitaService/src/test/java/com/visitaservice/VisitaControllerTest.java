package com.visitaservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visitaservice.controller.VisitaController;
import com.visitaservice.entity.EquipeTecnica;
import com.visitaservice.entity.dto.visita.VisitaRequest;
import com.visitaservice.entity.dto.visita.VisitaResponse;
import com.visitaservice.service.capsule.VisitaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = VisitaController.class)
class VisitaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VisitaService service;

    @Autowired
    private ObjectMapper objectMapper;

    private VisitaRequest validRequest;
    private VisitaResponse validResponse;
    private List<EquipeTecnica> membros;
    private final Long EXISTING_ID = 1L;
    private final Long NON_EXISTING_ID = 99L;

    @BeforeEach
    void setUp() {
        membros = List.of(
                new EquipeTecnica("Ana", "Médica"),
                new EquipeTecnica("Bruno", "Paramédico")
        );

        validRequest = VisitaRequest.builder()
                .dataVisita(new Date(1627776000000L))  // 1 ago 2021
                .idBase(EXISTING_ID)
                .membros(membros)
                .build();

        validResponse = VisitaResponse.builder()
                .id(EXISTING_ID)
                .dataVisita(validRequest.getDataVisita())
                .idBase(EXISTING_ID)
                .membros(membros)
                .build();
    }

    @Test
    @DisplayName("GET /{id} retorna 200 e body quando encontrado")
    void getById_Found() throws Exception {
        doReturn(validResponse).when(service).getById(EXISTING_ID);

        mockMvc.perform(get("/" + EXISTING_ID)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(EXISTING_ID))
                .andExpect(jsonPath("$.membros.length()").value(2));
    }

    @Test
    @DisplayName("GET / retorna lista de VisitaResponse")
    void getAll_ReturnsList() throws Exception {
        doReturn(List.of(validResponse)).when(service).getAll();

        mockMvc.perform(get("/")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(EXISTING_ID));
    }

    @Test
    @DisplayName("GET /exists/{id} retorna boolean")
    void existsById() throws Exception {
        doReturn(true).when(service).existsVisitaById(EXISTING_ID);

        mockMvc.perform(get("/exists/" + EXISTING_ID))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    @DisplayName("POST / cria e retorna VisitaResponse")
    void createVisita_Success() throws Exception {
        doReturn(validResponse).when(service).createVisita(any(VisitaRequest.class));

        mockMvc.perform(post("/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idBase").value(EXISTING_ID))
                .andExpect(jsonPath("$.membros.length()").value(2));
    }

    @Test
    @DisplayName("POST / com payload inválido retorna 400")
    void createVisita_InvalidBody() throws Exception {
        // body vazio, falta campos obrigatórios
        mockMvc.perform(post("/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ }"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /{id} atualiza e retorna VisitaResponse")
    void updateVisita_Success() throws Exception {
        doReturn(validResponse).when(service).updateVisita(eq(EXISTING_ID), any(VisitaRequest.class));

        mockMvc.perform(put("/" + EXISTING_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(EXISTING_ID));
    }

    @Test
    @DisplayName("PUT /{id} com payload inválido retorna 400")
    void updateVisita_InvalidBody() throws Exception {
        mockMvc.perform(put("/" + EXISTING_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"invalid\": \"json\" }"))
                .andExpect(status().isBadRequest());
    }


    @Test
    @DisplayName("DELETE /{id} retorna 204 quando bem-sucedido")
    void delete_Success() throws Exception {
        mockMvc.perform(delete("/" + EXISTING_ID))
                .andExpect(status().isNoContent());
    }

}
