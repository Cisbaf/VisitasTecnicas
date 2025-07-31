package com.baseservice;

import com.baseservice.controller.BaseController;
import com.baseservice.entity.BaseRequest;
import com.baseservice.service.capsule.BaseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = BaseController.class)
class BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BaseService baseService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET / returns list of BaseRequest")
    void findAll_ReturnsList() throws Exception {
        BaseRequest dto1 = BaseRequest.builder().nome("B1").endereco("E1").tipoBase("T1").build();
        BaseRequest dto2 = BaseRequest.builder().nome("B2").endereco("E2").tipoBase("T2").build();
        doReturn(List.of(dto1, dto2)).when(baseService).getAll();

        mockMvc.perform(get("/").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nome").value("B1"))
                .andExpect(jsonPath("$[1].nome").value("B2"));
    }

    @Test
    @DisplayName("GET /{id} returns BaseRequest when found")
    void findById_Found() throws Exception {
        BaseRequest dto = BaseRequest.builder().nome("B1").endereco("E1").tipoBase("T1").build();
        doReturn(dto).when(baseService).getById(1L);

        mockMvc.perform(get("/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("B1"));
    }

    @Test
    @DisplayName("GET /{id} returns 404 when service returns null")
    void findById_NotFound() throws Exception {
        doReturn(null).when(baseService).getById(2L);

        mockMvc.perform(get("/2").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /exists/{id} returns boolean")
    void existsById_ReturnsTrue() throws Exception {
        doReturn(true).when(baseService).existsById(1L);

        mockMvc.perform(get("/exists/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    @DisplayName("POST / saves BaseRequest and returns it")
    void save_ReturnsSaved() throws Exception {
        BaseRequest dto = BaseRequest.builder().nome("B1").endereco("E1").tipoBase("T1").build();
        doReturn(dto).when(baseService).createBase(any(BaseRequest.class));

        mockMvc.perform(post("/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("B1"));
    }

    @Test
    @DisplayName("PUT /{id} updates BaseRequest and returns it")
    void update_ReturnsUpdated() throws Exception {
        BaseRequest dto = BaseRequest.builder().nome("B2").endereco("E2").tipoBase("T2").build();
        doReturn(dto).when(baseService).update(1L, dto);

        mockMvc.perform(put("/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.endereco").value("E2"));
    }

    @Test
    @DisplayName("PUT /{id} returns 404 when service returns null")
    void update_NotFound() throws Exception {
        BaseRequest dto = BaseRequest.builder().nome("B2").endereco("E2").tipoBase("T2").build();
        doReturn(null).when(baseService).update(3L, dto);

        mockMvc.perform(put("/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /{id} returns no content")
    void deleteById_Success() throws Exception {
        mockMvc.perform(delete("/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /{id} propagates exception")
    void deleteById_Throws() throws Exception {
        doThrow(new RuntimeException("erro")).when(baseService).deleteBase(5L);

        mockMvc.perform(delete("/5"))
                .andExpect(status().isInternalServerError());
    }
}
