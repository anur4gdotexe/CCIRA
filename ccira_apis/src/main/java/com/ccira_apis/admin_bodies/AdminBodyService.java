package com.ccira_apis.admin_bodies;

import com.ccira_apis.maps.LocationAdminService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminBodyService {
    private final LocationAdminService locationAdminService;
    private final AdminBodyRepository adminBodyRepository;

    public AdminBodyService(LocationAdminService locationAdminService,
                            AdminBodyRepository adminBodyRepository) {
        this.locationAdminService = locationAdminService;
        this.adminBodyRepository = adminBodyRepository;
    }

//    public List<Optional<AdminBody>> getAdminBodies (String state, String district) {
//        List<String> adminIds = locationAdminService.getAdminIds(state, district);
//
//        return adminIds.stream()
//                .map(adminId -> adminBodyRepository.findById(adminId))
//                .toList();
//    }
}
