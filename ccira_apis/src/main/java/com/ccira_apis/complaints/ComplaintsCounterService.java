package com.ccira_apis.complaints;

import com.ccira_apis.counter.CounterService;
import org.springframework.stereotype.Service;

@Service
public class ComplaintsCounterService {

    private final CounterService counterService;

    public ComplaintsCounterService(CounterService counterService) {
        this.counterService = counterService;
    }

    public String generateComplaintId() {
        return counterService.generateId("complaints_counter", "C", 4);
    }
}
