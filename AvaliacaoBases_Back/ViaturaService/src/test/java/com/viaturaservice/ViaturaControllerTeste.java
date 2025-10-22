package com.viaturaservice;

import com.viaturaservice.controller.ViaturaController;
import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaResponse;
import com.viaturaservice.service.BaseService;
import com.viaturaservice.service.capsule.ViaturaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ViaturaControllerTest {

    @Mock
    private ViaturaService viaturaService;

    @Mock
    private BaseService exists;

    @InjectMocks
    private ViaturaController viaturaController;

    @Test
    void findAllReturnsListOfViaturas() {
        List<ViaturaResponse> viaturas = List.of(ViaturaResponse.builder()
                .id(1L)
                .placa("ABC1234")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .build(), ViaturaResponse.builder()
                .id(2L)
                .placa("ABC5678")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .build());
        when(viaturaService.getAllViaturas()).thenReturn(viaturas);

        ResponseEntity<List<ViaturaResponse>> response = viaturaController.findAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(viaturas, response.getBody());
    }

    @Test
    void findByIdReturnsViaturaWhenExists() {
        ViaturaResponse viatura = ViaturaResponse.builder()
                .id(1L)
                .placa("ABC1234")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .build();
        when(viaturaService.getViaturaById(1L)).thenReturn(viatura);

        ResponseEntity<ViaturaResponse> response = viaturaController.findById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(viatura, response.getBody());
    }

    @Test
    void findByIdReturnsNotFoundWhenViaturaDoesNotExist() {
        when(viaturaService.getViaturaById(1L)).thenReturn(null);

        ResponseEntity<ViaturaResponse> response = viaturaController.findById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void saveReturnsBadRequestWhenViaturaIsNull() {
        ResponseEntity<ViaturaResponse> response = viaturaController.save(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void saveReturnsBadRequestWhenIdBaseDoesNotExist() {
        ViaturaRequest viatura = ViaturaRequest.builder()
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .build();
        when(exists.existsById(viatura.idBase())).thenReturn(false);

        ResponseEntity<ViaturaResponse> response = viaturaController.save(viatura);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }



    @Test
    void deleteByIdReturnsBadRequestWhenIdIsNull() {
        ResponseEntity<Void> response = viaturaController.deleteById(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void deleteByIdReturnsNoContentWhenValid() {
        doNothing().when(viaturaService).deleteViatura(1L);

        ResponseEntity<Void> response = viaturaController.deleteById(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void updateReturnsBadRequestWhenIdIsNull() {
        ResponseEntity<ViaturaResponse> response = viaturaController.update(null, ViaturaRequest.builder()
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .build());

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void updateReturnsBadRequestWhenViaturaIsNull() {
        ResponseEntity<ViaturaResponse> response = viaturaController.update(1L, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void updateReturnsUpdatedViaturaWhenValid() {
        ViaturaRequest viatura = ViaturaRequest.builder()
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .build();
        ViaturaResponse updatedViatura = ViaturaResponse.builder()
                .id(1L)
                .placa("ABC9871")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .build();
        when(viaturaService.updateViatura(1L, viatura)).thenReturn(updatedViatura);

        ResponseEntity<ViaturaResponse> response = viaturaController.update(1L, viatura);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedViatura, response.getBody());
    }
}