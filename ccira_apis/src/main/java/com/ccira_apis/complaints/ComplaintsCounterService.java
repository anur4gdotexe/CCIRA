package com.ccira_apis.complaints;

import org.springframework.stereotype.Service;

@Service
public class ComplaintsCounterService {
    private final ComplaintsCounterRepository complaintsCounterRepository;

    public ComplaintsCounterService (ComplaintsCounterRepository complaintsCounterRepository) {
        this.complaintsCounterRepository = complaintsCounterRepository;
    }

    public String generateComplaintId() {
        ComplaintsCounter complaintsCounter = complaintsCounterRepository
                .findById("complaints_counter")
                .orElseThrow(() -> new RuntimeException("counter not found"));

        int count = complaintsCounter.getComplaintCount() + 1;

        complaintsCounter.setComplaintCount(count);
        complaintsCounterRepository.save(complaintsCounter);

        return String.format("C%04d", count);
    }
}
