package com.checklistitemservice.service;

import com.checklistitemservice.entity.CheckDescription;
import com.checklistitemservice.entity.CheckListEntity;
import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
import com.checklistitemservice.entity.enums.TipoConformidade;
import com.checklistitemservice.respository.CheckListRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckListServiceImpTest {

    @Mock
    private CheckListRepository repository;

    @Mock
    private CheckListMapper mapper;

    @InjectMocks
    private CheckListServiceImp service;

    // Testes de criação
    @Test
    void createCheckList_ValidRequest_ReturnsResponse() {
        CheckListRequest request = TestDataUtil.createValidRequest();
        CheckListEntity entity = new CheckListEntity(1L, request.categoria(), request.descricao());
        CheckListResponse response = new CheckListResponse(1L, entity.getCategoria(), entity.getDescricao());

        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        CheckListResponse result = service.createCheckList(request);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Segurança", result.categoria());
        assertEquals(2, result.descricao().size());
        verify(repository).save(entity);
    }

    @Test
    void createCheckList_NullRequest_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.createCheckList(null)
        );
        assertEquals("CheckList não pode ser nulo", exception.getMessage());
    }

    // Testes de criação em lote
    @Test
    void createCheckLists_ValidList_ReturnsResponses() {
        List<CheckListRequest> requests = TestDataUtil.createValidRequests();
        CheckListEntity entity1 = new CheckListEntity(1L, "Segurança", requests.get(0).descricao());
        CheckListEntity entity2 = new CheckListEntity(2L, "Limpeza", requests.get(1).descricao());

        when(mapper.toEntity(requests.get(0))).thenReturn(entity1);
        when(mapper.toEntity(requests.get(1))).thenReturn(entity2);
        when(repository.save(entity1)).thenReturn(entity1);
        when(repository.save(entity2)).thenReturn(entity2);
        when(mapper.toResponse(entity1)).thenReturn(new CheckListResponse(1L, "Segurança", entity1.getDescricao()));
        when(mapper.toResponse(entity2)).thenReturn(new CheckListResponse(2L, "Limpeza", entity2.getDescricao()));

        List<CheckListResponse> results = service.createCheckLists(requests);

        assertEquals(2, results.size());
        assertEquals("Limpeza", results.get(1).categoria());
    }

    @Test
    void createCheckLists_EmptyList_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.createCheckLists(Collections.emptyList())
        );
        assertEquals("Lista de CheckLists não pode ser nula ou vazia", exception.getMessage());
    }

    @Test
    void createCheckLists_ListWithInvalidElement_ThrowsException() {
        List<CheckListRequest> requests = Collections.singletonList(TestDataUtil.createInvalidRequest());

        // Configura o mapper para retornar entidade inválida
        when(mapper.toEntity(any())).thenReturn(new CheckListEntity());

        // Verifica se a exceção é lançada ao salvar
        assertThrows(
                Exception.class,
                () -> service.createCheckLists(requests)
        );
    }

    // Testes de busca por ID
    @Test
    void getById_ExistingId_ReturnsResponse() {
        List<CheckDescription> descriptions = Collections.singletonList(
                TestDataUtil.createCheckDescription("Verificar servidores", 75, TipoConformidade.PARCIAL, "Necessário upgrade")
        );

        CheckListEntity entity = new CheckListEntity(1L, "TI", descriptions);
        CheckListResponse response = new CheckListResponse(1L, "TI", descriptions);

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(mapper.toResponse(entity)).thenReturn(response);

        CheckListResponse result = service.getById(1L);

        assertEquals("TI", result.categoria());
        assertEquals(1, result.descricao().size());

        CheckDescription item = result.descricao().get(0);
        assertEquals(75, item.getConformidadePercent());
        assertEquals(TipoConformidade.PARCIAL, item.getTipoConformidade());
    }

    @Test
    void getById_NonExistingId_ThrowsException() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.getById(999L)
        );
        assertEquals("CheckList não encontrado com ID: 999", exception.getMessage());
    }

    // Testes de atualização
    @Test
    void update_ValidRequest_ReturnsUpdatedResponse() {
        // Entidade existente
        List<CheckDescription> oldDescriptions = Collections.singletonList(
                TestDataUtil.createCheckDescription("Antiga descrição", 0, TipoConformidade.NAO_CONFORME, "Item crítico")
        );

        CheckListEntity existingEntity = new CheckListEntity(1L, "Antiga", oldDescriptions);

        // Request de atualização
        List<CheckDescription> newDescriptions = Arrays.asList(
                TestDataUtil.createCheckDescription("Nova descrição 1", 100, TipoConformidade.CONFORME, "Aprovado"),
                TestDataUtil.createCheckDescription("Nova descrição 2", 50, TipoConformidade.PARCIAL, "Parcialmente aprovado")
        );

        CheckListRequest request = new CheckListRequest("Atualizada", newDescriptions);

        // Entidade atualizada
        CheckListEntity updatedEntity = new CheckListEntity(1L, "Atualizada", newDescriptions);
        CheckListResponse response = new CheckListResponse(1L, "Atualizada", newDescriptions);

        when(repository.findById(1L)).thenReturn(Optional.of(existingEntity));
        when(mapper.toEntity(request)).thenReturn(updatedEntity);
        when(repository.save(updatedEntity)).thenReturn(updatedEntity);
        when(mapper.toResponse(updatedEntity)).thenReturn(response);

        CheckListResponse result = service.update(1L, request);

        assertEquals("Atualizada", result.categoria());
        assertEquals(2, result.descricao().size());

        // Verificando campos atualizados
        CheckDescription secondItem = result.descricao().get(1);
        assertEquals(50, secondItem.getConformidadePercent());
        assertEquals("Parcialmente aprovado", secondItem.getObservacao());
    }

    @Test
    void update_WithEmptyDescription_ThrowsException() {
        CheckListRequest invalidRequest = new CheckListRequest("Categoria", Collections.emptyList());

        when(repository.findById(1L)).thenReturn(Optional.of(new CheckListEntity()));

        // Como as validações são feitas antes do serviço, isso testaria o comportamento do mapper
        assertThrows(
                Exception.class,
                () -> service.update(1L, invalidRequest)
        );
    }

    // Testes de deleção
    @Test
    void deleteCheckList_ExistingId_DeletesSuccessfully() {
        when(repository.existsById(1L)).thenReturn(true);
        service.deleteCheckList(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    void deleteCheckList_NonExistingId_ThrowsException() {
        when(repository.existsById(999L)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.deleteCheckList(999L)
        );
        assertEquals("CheckList não encontrado com ID: 999", exception.getMessage());
    }

    // Casos "burros"
    @Test
    void update_NonExistingIdWithValidRequest_ThrowsException() {
        CheckListRequest validRequest = TestDataUtil.createValidRequest();

        when(repository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.update(999L, validRequest)
        );
        assertEquals("CheckList não encontrado com ID: 999", exception.getMessage());
    }

    @Test
    void createCheckList_WithZeroConformity_WorksCorrectly() {
        CheckListRequest request = new CheckListRequest(
                "Qualidade",
                Collections.singletonList(
                        TestDataUtil.createCheckDescription("Item crítico", 0, TipoConformidade.NAO_CONFORME, "Rejeitado")
                )
        );

        CheckListEntity entity = new CheckListEntity(1L, request.categoria(), request.descricao());
        CheckListResponse response = new CheckListResponse(1L, "Qualidade", request.descricao());

        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        CheckListResponse result = service.createCheckList(request);

        assertEquals(TipoConformidade.NAO_CONFORME, result.descricao().get(0).getTipoConformidade());
    }

    @Test
    void createCheckList_WithNullObservation_WorksCorrectly() {
        CheckListRequest request = new CheckListRequest(
                "Teste",
                Collections.singletonList(
                        TestDataUtil.createCheckDescription("Sem observação", 100, TipoConformidade.CONFORME, null)
                )
        );

        CheckListEntity entity = new CheckListEntity(1L, request.categoria(), request.descricao());

        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);

        assertDoesNotThrow(() -> service.createCheckList(request));
        assertNull(entity.getDescricao().get(0).getObservacao());
    }
}