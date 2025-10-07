package com.baseservice;

import com.baseservice.controller.BaseController;
import com.baseservice.entity.BaseRequest;
import com.baseservice.entity.BaseResponse;
import com.baseservice.service.capsule.BaseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
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

    @MockitoBean
    private BaseService baseService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET / returns list of BaseResponse")
    void findAll_ReturnsList() throws Exception {
        BaseResponse res1 = BaseResponse.builder().nome("B1").endereco("E1").tipoBase("T1").build();
        BaseResponse res2 = BaseResponse.builder().nome("B2").endereco("E2").tipoBase("T2").build();
        doReturn(List.of(res1, res2)).when(baseService).getAll();

        mockMvc.perform(get("/").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nome").value("B1"))
                .andExpect(jsonPath("$[1].nome").value("B2"));
    }

    @Test
    @DisplayName("GET /{id} returns BaseResponse when found")
    void findById_Found() throws Exception {
        BaseResponse res = BaseResponse.builder().nome("B1").endereco("E1").tipoBase("T1").build();
        doReturn(res).when(baseService).getById(1L);

        mockMvc.perform(get("/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("B1"));
    }

    @Test
    @DisplayName("GET /{id} returns 404 when not found")
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
    @DisplayName("DELETE /{id} returns 204 when successful")
    void deleteById_Success() throws Exception {
        mockMvc.perform(delete("/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /{id} returns 500 when service throws")
    void deleteById_Throws() throws Exception {
        doThrow(new RuntimeException("erro")).when(baseService).deleteBase(5L);

        mockMvc.perform(delete("/5"))
                .andExpect(status().isInternalServerError());
    }
}
