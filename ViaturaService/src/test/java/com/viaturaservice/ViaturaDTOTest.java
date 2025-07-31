package com.viaturaservice;

import com.viaturaservice.entity.ViaturaDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.validation.*;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ViaturaDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @DisplayName("Validação de ViaturaDTO")
    @Nested
    class ValidacaoViaturaDTO {

        @org.junit.jupiter.api.Test
        void deveSerValidoQuandoTodosOsCamposForemValidos() {
            ViaturaDTO dto = ViaturaDTO.builder()
                    .placa("ABC1234")
                    .modelo("Gol")
                    .ano("2020")
                    .tipoViatura("Patrulha")
                    .statusOperacional("Ativo")
                    .idBase(1L)
                    .itens(List.of())
                    .build();

            Set<ConstraintViolation<ViaturaDTO>> violations = validator.validate(dto);
            assertTrue(violations.isEmpty());
        }

        @org.junit.jupiter.api.Test
        void deveFalharQuandoPlacaForInvalida() {
            ViaturaDTO dto = ViaturaDTO.builder()
                    .placa("1234567")
                    .modelo("Gol")
                    .ano("2020")
                    .tipoViatura("Patrulha")
                    .statusOperacional("Ativo")
                    .idBase(1L)
                    .itens(List.of())
                    .build();

            Set<ConstraintViolation<ViaturaDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("placa")));
        }

        @org.junit.jupiter.api.Test
        void deveFalharQuandoAnoNaoTiverQuatroDigitos() {
            ViaturaDTO dto = ViaturaDTO.builder()
                    .placa("ABC1234")
                    .modelo("Gol")
                    .ano("20")
                    .tipoViatura("Patrulha")
                    .statusOperacional("Ativo")
                    .idBase(1L)
                    .itens(List.of())
                    .build();

            Set<ConstraintViolation<ViaturaDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("ano")));
        }

        @org.junit.jupiter.api.Test
        void deveFalharQuandoIdBaseForNuloOuNegativo() {
            ViaturaDTO dtoNulo = ViaturaDTO.builder()
                    .placa("ABC1234")
                    .modelo("Gol")
                    .ano("2020")
                    .tipoViatura("Patrulha")
                    .statusOperacional("Ativo")
                    .idBase(null)
                    .itens(List.of())
                    .build();

            ViaturaDTO dtoNegativo = ViaturaDTO.builder()
                    .placa("ABC1234")
                    .modelo("Gol")
                    .ano("2020")
                    .tipoViatura("Patrulha")
                    .statusOperacional("Ativo")
                    .idBase(-1L)
                    .itens(List.of())
                    .build();

            Set<ConstraintViolation<ViaturaDTO>> violationsNulo = validator.validate(dtoNulo);
            Set<ConstraintViolation<ViaturaDTO>> violationsNegativo = validator.validate(dtoNegativo);

            assertFalse(violationsNulo.isEmpty());
            assertFalse(violationsNegativo.isEmpty());
            assertTrue(violationsNulo.stream().anyMatch(v -> v.getPropertyPath().toString().equals("idBase")));
            assertTrue(violationsNegativo.stream().anyMatch(v -> v.getPropertyPath().toString().equals("idBase")));
        }

        @org.junit.jupiter.api.Test
        void deveFalharQuandoItensForNulo() {
            ViaturaDTO dto = ViaturaDTO.builder()
                    .placa("ABC1234")
                    .modelo("Gol")
                    .ano("2020")
                    .tipoViatura("Patrulha")
                    .statusOperacional("Ativo")
                    .idBase(1L)
                    .itens(null)
                    .build();

            Set<ConstraintViolation<ViaturaDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("itens")));
        }
    }
}

