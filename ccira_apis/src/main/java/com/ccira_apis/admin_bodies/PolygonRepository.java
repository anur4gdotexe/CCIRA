package com.ccira_apis.admin_bodies;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolygonRepository extends MongoRepository<Polygon, String> {
    List<Polygon> findByAdminId(String adminId);
}
