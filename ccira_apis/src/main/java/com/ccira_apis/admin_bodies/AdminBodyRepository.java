package com.ccira_apis.admin_bodies;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminBodyRepository extends MongoRepository<AdminBody, String> {
}
