package com.ccira_apis.maps;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintUserRepository extends MongoRepository<ComplaintUserMap, String> {
    List<ComplaintUserMap> findByUserId(String userId);

    void deleteAllByComplaintId(String complaintId);
}
