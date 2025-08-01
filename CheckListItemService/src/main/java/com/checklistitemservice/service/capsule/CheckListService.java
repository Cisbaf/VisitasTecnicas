package com.checklistitemservice.service.capsule;

import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;

import java.util.List;

public interface CheckListService {
    CheckListResponse createCheckList(CheckListRequest request);

    List<CheckListResponse> createCheckLists(List<CheckListRequest> requests);

    CheckListResponse getById(Long id);

    List<CheckListResponse> getAll();

    CheckListResponse update(Long id, CheckListRequest request);

    void deleteCheckList(Long id);

    boolean existsById(Long id);
}
