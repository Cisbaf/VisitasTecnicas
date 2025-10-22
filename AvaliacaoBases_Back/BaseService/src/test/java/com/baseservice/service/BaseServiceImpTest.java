package com.baseservice.service;

import com.baseservice.entity.BaseRequest;
import com.baseservice.entity.BaseEntity;
import com.baseservice.entity.BaseResponse;
import com.baseservice.repository.BaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static com.baseservice.service.BaseMapper.toDTO;
import static com.baseservice.service.BaseMapper.toEntity;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BaseServiceImpTest {

    @Mock
    private BaseRepository baseRepository;

    @InjectMocks
    private BaseServiceImp baseService;

    private BaseRequest baseRequest;
    private BaseEntity baseEntity;
    private BaseResponse baseResponse;

    @BeforeEach
    void setup() {
        baseRequest = BaseRequest.builder()
                .nome("Base1")
                .endereco("End1")

                .build();

        baseEntity = new BaseEntity();
        baseEntity.setId(1L);
        baseEntity.setNome("Base1");
        baseEntity.setEndereco("End1");
        baseEntity.setTipoBase("TipoA");

        baseResponse = BaseResponse.builder()
                .id(1L)
                .nome("Base1")
                .endereco("End1")
                .build();
    }

    @Test
    void createBase_Success() {
        try (MockedStatic<BaseMapper> mapper = Mockito.mockStatic(BaseMapper.class)) {
            mapper.when(() -> toEntity(baseRequest)).thenReturn(baseEntity);
            mapper.when(() -> toDTO(baseEntity)).thenReturn(baseResponse);
            when(baseRepository.save(baseEntity)).thenReturn(baseEntity);

            BaseResponse result = baseService.createBase(baseRequest);

            assertEquals(baseResponse, result);
            verify(baseRepository).save(baseEntity);
        }
    }

    @Test
    void createBase_NullDTO() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> baseService.createBase(null)
        );
        assertEquals("Base cannot be null", ex.getMessage());
    }

    @Test
    void createBase_DataIntegrityViolation() {
        try (MockedStatic<BaseMapper> mapper = Mockito.mockStatic(BaseMapper.class)) {
            mapper.when(() -> toEntity(baseRequest)).thenReturn(baseEntity);
            when(baseRepository.save(baseEntity))
                    .thenThrow(new DataIntegrityViolationException("dup key"));

            IllegalArgumentException ex = assertThrows(
                    IllegalArgumentException.class,
                    () -> baseService.createBase(baseRequest)
            );
            assertTrue(ex.getMessage().contains("dup key"));
        }
    }

    @Test
    void getById_Success() {
        try (MockedStatic<BaseMapper> mapper = Mockito.mockStatic(BaseMapper.class)) {
            when(baseRepository.findById(1L)).thenReturn(Optional.of(baseEntity));
            mapper.when(() -> toDTO(baseEntity)).thenReturn(baseResponse);

            BaseResponse result = baseService.getById(1L);
            assertEquals(baseResponse, result);
        }
    }

    @Test
    void getById_NullId() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> baseService.getById(null)
        );
        assertEquals("ID cannot be null", ex.getMessage());
    }

    @Test
    void getById_NotFound() {
        when(baseRepository.findById(2L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> baseService.getById(2L)
        );
        assertTrue(ex.getMessage().contains("Base not found with id: 2"));
    }

    @Test
    void getAll_ReturnsList() {
        BaseEntity e2 = new BaseEntity();
        e2.setId(2L);
        e2.setNome("B2");
        e2.setEndereco("E2");
        e2.setTipoBase("T2");

        BaseResponse r2 = BaseResponse.builder()
                .id(2L).nome("B2").endereco("E2").build();

        when(baseRepository.findAll()).thenReturn(List.of(baseEntity, e2));
        try (MockedStatic<BaseMapper> mapper = Mockito.mockStatic(BaseMapper.class)) {
            mapper.when(() -> toDTO(baseEntity)).thenReturn(baseResponse);
            mapper.when(() -> toDTO(e2)).thenReturn(r2);

            List<BaseResponse> list = baseService.getAll();
            assertEquals(2, list.size());
            assertTrue(list.containsAll(List.of(baseResponse, r2)));
        }
    }

    @Test
    void getAll_EmptyList() {
        when(baseRepository.findAll()).thenReturn(Collections.emptyList());

        List<BaseResponse> list = baseService.getAll();
        assertTrue(list.isEmpty());
    }

    @Test
    void update_Success() {
        BaseRequest updatedRequest = BaseRequest.builder()
                .nome("BaseUpd")
                .endereco("EndUpd")

                .build();

        BaseEntity updatedEntity = new BaseEntity();
        updatedEntity.setId(1L);
        updatedEntity.setNome("BaseUpd");
        updatedEntity.setEndereco("EndUpd");
        updatedEntity.setTipoBase("TipoB");

        BaseResponse updatedResponse = BaseResponse.builder()
                .id(1L)
                .nome("BaseUpd")
                .endereco("EndUpd")

                .build();

        when(baseRepository.findById(1L)).thenReturn(Optional.of(baseEntity));
        when(baseRepository.save(any(BaseEntity.class))).thenReturn(updatedEntity);

        try (MockedStatic<BaseMapper> mapper = Mockito.mockStatic(BaseMapper.class)) {
            mapper.when(() -> toDTO(updatedEntity)).thenReturn(updatedResponse);

            BaseResponse result = baseService.update(1L, updatedRequest);
            assertEquals(updatedResponse, result);
        }
    }

    @Test
    void update_NullIdOrDTO() {
        assertThrows(IllegalArgumentException.class, () -> baseService.update(null, baseRequest));
        assertThrows(IllegalArgumentException.class, () -> baseService.update(1L, null));
    }

    @Test
    void update_NotFound() {
        when(baseRepository.findById(3L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> baseService.update(3L, baseRequest)
        );
        assertTrue(ex.getMessage().contains("Base not found with id: 3"));
    }


    @Test
    void deleteBase_NotFound() {
        when(baseRepository.existsById(4L)).thenReturn(false);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> baseService.deleteBase(4L)
        );
        assertTrue(ex.getMessage().contains("Base not found with id: 4"));
    }

    @Test
    void existsById_SuccessAndFailure() {
        when(baseRepository.existsById(1L)).thenReturn(true);
        when(baseRepository.existsById(2L)).thenReturn(false);

        assertTrue(baseService.existsById(1L));
        assertFalse(baseService.existsById(2L));
    }

    @Test
    void existsById_NullId() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> baseService.existsById(null)
        );
        assertEquals("ID cannot be null", ex.getMessage());
    }

    @Test
    void deleteBase_DeleteThrows() {
        when(baseRepository.existsById(1L)).thenReturn(true);
        doThrow(new RuntimeException("del error")).when(baseRepository).deleteById(1L);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> baseService.deleteBase(1L)
        );
        assertEquals("del error", ex.getMessage());
    }
}
