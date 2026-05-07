package com.ccira_apis.admin_bodies;

import com.ccira_apis.maps.LocationAdminMap;
import com.ccira_apis.maps.LocationAdminRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
public class AdminBodyService {
    private final LocationAdminRepository locationAdminRepository;
    private final AdminBodyRepository adminBodyRepository;

    public AdminBodyService(LocationAdminRepository locationAdminRepository,
                            AdminBodyRepository adminBodyRepository) {
        this.locationAdminRepository = locationAdminRepository;
        this.adminBodyRepository = adminBodyRepository;
    }

    public Map<String, Object> getMe() {
        String adminId = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        AdminBody admin = adminBodyRepository.findById(adminId)
                .orElseThrow(() -> new NoSuchElementException("Admin not found: " + adminId));

        List<LocationAdminMap> locations = locationAdminRepository.findByAdminId(adminId);

        String state = null;
        String district = null;
        if (!locations.isEmpty()) {
            state    = locations.get(0).getState();
            district = locations.get(0).getDistrict();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("adminId",   admin.getAdminId());
        result.put("adminName", admin.getAdminName());
        result.put("email",     admin.getEmail());
        result.put("state",     state);
        result.put("district",  district);

        return result;
    }
}
