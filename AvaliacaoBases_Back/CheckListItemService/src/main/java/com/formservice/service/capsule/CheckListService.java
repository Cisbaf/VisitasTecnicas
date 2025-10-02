package com.formservice.service.capsule;

import com.formservice.entity.CheckDescription;
import com.formservice.entity.dto.CheckListRequest;
import com.formservice.entity.dto.CheckListResponse;

import java.util.List;

public interface CheckListService {
    CheckListResponse createCheckList(CheckListRequest request);

    List<CheckListResponse> createCheckLists(List<CheckListRequest> requests);

    CheckListResponse getById(Long id);

    List<CheckListResponse> getAll();

    List<CheckListResponse> getByVisitaId(Long visitaId);
    List<CheckListResponse> getByViaturaId(Long viaturaId) ;

    CheckListResponse addDescriptionToCheckList(Long checkListId, CheckDescription description);

    CheckListResponse update(Long id, CheckListRequest request);

    void deleteCheckList(Long id);

    boolean existsById(Long id);

    boolean descriptionExist(Long descriptionId);
}
