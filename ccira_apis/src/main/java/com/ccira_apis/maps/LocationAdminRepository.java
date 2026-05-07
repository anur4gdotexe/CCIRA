package com.ccira_apis.maps;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationAdminRepository extends MongoRepository<LocationAdminMap, String> {
    List<LocationAdminMap> findByStateAndDistrict(String state, String district);
    List<LocationAdminMap> findByAdminId(String adminId);
}
