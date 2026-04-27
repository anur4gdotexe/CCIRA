package com.ccira_apis.complaints;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintsCounterRepository extends MongoRepository<ComplaintsCounter, String> {
}
