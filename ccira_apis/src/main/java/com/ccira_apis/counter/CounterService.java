package com.ccira_apis.counter;

import org.springframework.stereotype.Service;

@Service
public class CounterService {

    private final CounterRepository counterRepository;

    public CounterService(CounterRepository counterRepository) {
        this.counterRepository = counterRepository;
    }

    /**
     * Increments the counter for the given id and returns the next formatted ID.
     * e.g. generateId("complaints_counter", "C", 4) → "C0001"
     *      generateId("users_counter",      "U", 3) → "U001"
     */
    public synchronized String generateId(String counterId, String prefix, int digits) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found: " + counterId));

        int next = counter.getCount() + 1;
        counter.setCount(next);
        counterRepository.save(counter);

        return prefix + String.format("%0" + digits + "d", next);
    }
}
