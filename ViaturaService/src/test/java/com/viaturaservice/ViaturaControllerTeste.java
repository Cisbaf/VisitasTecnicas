package com.viaturaservice;

import com.viaturaservice.controller.ViaturaController;
import com.viaturaservice.entity.Itens;
import com.viaturaservice.entity.ViaturaDTO;
import com.viaturaservice.service.IdBaseExists;
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
    private IdBaseExists exists;

    @InjectMocks
    private ViaturaController viaturaController;

    @Test
    void findAllReturnsListOfViaturas() {
        List<ViaturaDTO> viaturas = List.of(ViaturaDTO.builder()
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .itens(List.of(new Itens()))
                .build(), ViaturaDTO.builder()
                .placa("ABC5678")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .itens(List.of(new Itens()))
                .build());
        when(viaturaService.getAllViaturas()).thenReturn(viaturas);

        ResponseEntity<List<ViaturaDTO>> response = viaturaController.findAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(viaturas, response.getBody());
    }

    @Test
    void findByIdReturnsViaturaWhenExists() {
        ViaturaDTO viatura = ViaturaDTO.builder()
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .itens(List.of(new Itens()))
                .build();
        when(viaturaService.getViaturaById(1L)).thenReturn(viatura);

        ResponseEntity<ViaturaDTO> response = viaturaController.findById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(viatura, response.getBody());
    }

    @Test
    void findByIdReturnsNotFoundWhenViaturaDoesNotExist() {
        when(viaturaService.getViaturaById(1L)).thenReturn(null);

        ResponseEntity<ViaturaDTO> response = viaturaController.findById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void saveReturnsBadRequestWhenViaturaIsNull() {
        ResponseEntity<ViaturaDTO> response = viaturaController.save(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void saveReturnsBadRequestWhenIdBaseDoesNotExist() {
        ViaturaDTO viatura = ViaturaDTO.builder()
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .itens(List.of(new Itens()))
                .build();
        when(exists.existsById(viatura.getIdBase())).thenReturn(false);

        ResponseEntity<ViaturaDTO> response = viaturaController.save(viatura);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void saveReturnsCreatedViaturaWhenValid() {
        ViaturaDTO viatura = ViaturaDTO.builder()
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .itens(List.of(new Itens()))
                .build();
        when(exists.existsById(viatura.getIdBase())).thenReturn(true);
        when(viaturaService.createViatura(viatura)).thenReturn(viatura);

        ResponseEntity<ViaturaDTO> response = viaturaController.save(viatura);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(viatura, response.getBody());
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
        ResponseEntity<ViaturaDTO> response = viaturaController.update(null, ViaturaDTO.builder()
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .itens(List.of(new Itens()))
                .build());

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void updateReturnsBadRequestWhenViaturaIsNull() {
        ResponseEntity<ViaturaDTO> response = viaturaController.update(1L, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void updateReturnsUpdatedViaturaWhenValid() {
        ViaturaDTO viatura = ViaturaDTO.builder()
                .placa("ABC1234")
                .modelo("Gol")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .itens(List.of(new Itens()))
                .build();
        ViaturaDTO updatedViatura = ViaturaDTO.builder()
                .placa("ABC9871")
                .modelo("Versa")
                .ano("2020")
                .tipoViatura("Patrulha")
                .statusOperacional("Ativo")
                .idBase(1L)
                .itens(List.of(new Itens()))
                .build();
        when(viaturaService.updateViatura(1L, viatura)).thenReturn(updatedViatura);

        ResponseEntity<ViaturaDTO> response = viaturaController.update(1L, viatura);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedViatura, response.getBody());
    }
}