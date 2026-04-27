package com.ccira_apis.maps;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintAdminRepository extends MongoRepository<ComplaintAdminMap, String> {
    List<ComplaintAdminMap> findByAdminId(String adminId);

    List<ComplaintAdminMap> findByComplaintId(String complaintId);

    void deleteAllByComplaintId(String complaintId);
}
