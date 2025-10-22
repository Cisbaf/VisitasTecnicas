package com.viaturaservice.controller;

import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaResponse;
import com.viaturaservice.entity.dto.VeiculoDto;
import com.viaturaservice.service.BaseService;
import com.viaturaservice.service.ViaturaUpdateService;
import com.viaturaservice.service.capsule.ViaturaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ViaturaController {
    private final ViaturaService viaturaService;
    private final BaseService exists;
    private final ViaturaUpdateService viaturaUpdateService;

    @GetMapping("/registro")
    @Operation(summary = "Update Viaturas from external API", description = "Fetch and update viaturas from an external API.")
    public ResponseEntity<Void> getRegistros() {
        viaturaUpdateService.atualizarViaturasDiariamente();
        return ResponseEntity.accepted().build();
    }

    @Operation(summary = "Get all Viaturas", description = "Retrieve a list of all viaturas.")
    @GetMapping
    public ResponseEntity<List<ViaturaResponse>> findAll() {
        return ResponseEntity.ok(viaturaService.getAllViaturas());
    }

    @Operation(summary = "Get Viatura by ID", description = "Retrieve a viatura by its unique identifier.")
    @GetMapping("/{id}")
    public ResponseEntity<ViaturaResponse> findById(@PathVariable Long id) {
        var viaturaRequest = viaturaService.getViaturaById(id);
        if (viaturaRequest != null) {
            return ResponseEntity.ok(viaturaRequest);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get Viatura details from external API by plate", description = "Retrieve viatura details from an external API using the vehicle's plate number.")
    @GetMapping("/api/{placa}")
    public ResponseEntity<VeiculoDto> findByPeriodo(@PathVariable String placa) {
        var viaturaResponse = viaturaService.getVeiculoFromApi(placa);
        if (viaturaResponse != null) {
            return ResponseEntity.ok(viaturaResponse);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/api")
    @Operation(summary = "Get Viatura details from external API by period", description = "Retrieve viatura details from an external API using a specified time period.")
    public ResponseEntity<List<ViaturaResponse>> findByPeriodo(@RequestParam Long baseId, @RequestParam String data_inicio, @RequestParam String data_final) {
        List<ViaturaResponse> viaturaResponse;
        if (baseId > 0) {
             viaturaResponse = viaturaService.getVeiculoFromApiByPeriodo(baseId, data_inicio, data_final);
        }else{
            viaturaResponse = viaturaService.getVeiculoFromApiByPeriodo(data_inicio, data_final);
        }
        if (viaturaResponse != null) {
            return ResponseEntity.ok(viaturaResponse);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get All Viaturas by Base ID", description = "Retrieve all viaturas by its base ID.")
    @GetMapping("/base/{idBase}")
    public ResponseEntity<List<ViaturaResponse>> findByIdBase(@PathVariable Long idBase) {
        var viaturaRequest = viaturaService.getAllViaturasByIdBase(idBase);
        if (viaturaRequest != null) {
            return ResponseEntity.ok(viaturaRequest);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Check if Viatura exists by ID", description = "Check if a viatura exists by its ID.")
    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        boolean exists = viaturaService.existsViaturaById(id);
        return ResponseEntity.ok(exists);
    }

    @Operation(summary = "Create a new Viatura", description = "Create a new viatura with the provided details.")
    @PostMapping
    public ResponseEntity<ViaturaResponse> save(@RequestBody @Valid ViaturaRequest viaturaRequest) {
        if (viaturaRequest == null || !exists.existsById(viaturaRequest.idBase())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(viaturaService.createViatura(viaturaRequest));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Viatura by ID", description = "Delete a viatura by its unique identifier.")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        viaturaService.deleteViatura(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/base/{idBase}")
    @Operation(summary = "Delete all Viaturas by Base ID", description = "Delete all viaturas associated with a specific base ID.")
    public ResponseEntity<Void> deleteAllByBaseId(@PathVariable Long idBase) {
        if (idBase == null || !exists.existsById(idBase)) {
            return ResponseEntity.badRequest().build();
        }
        viaturaService.deleteAllByBaseId(idBase);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Viatura", description = "Update the details of an existing viatura by its ID.")
    public ResponseEntity<ViaturaResponse> update(@PathVariable Long id, @RequestBody @Valid ViaturaRequest viaturaRequest) {
        if (id == null || viaturaRequest == null) {
            return ResponseEntity.badRequest().build();
        }
        ViaturaResponse updatedViatura = viaturaService.updateViatura(id, viaturaRequest);
        return ResponseEntity.ok(updatedViatura);
    }

}
