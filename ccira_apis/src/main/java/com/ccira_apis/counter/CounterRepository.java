package com.ccira_apis.counter;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CounterRepository extends MongoRepository<Counter, String> {
}
