package com.ccira_apis.complaints;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {
    private final ComplaintService complaintService;
    private final ComplaintRepository complaintRepository;

    public ComplaintController(ComplaintService complaintService,
                               ComplaintRepository complaintRepository)
    {
        this.complaintService = complaintService;
        this.complaintRepository = complaintRepository;
    }

    @PostMapping("/users")
    ResponseEntity<Object> addComplaint(@RequestBody ComplaintSubmissionDTO complaintSubmissionDTO) {
        return ResponseEntity.status(201)
                .body(complaintService.addComplaint(complaintSubmissionDTO));
    }

    @GetMapping("/public")
    ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.status(200).body(complaintRepository.findAll());
    }

    @GetMapping("/public/{id}")
    ResponseEntity<Complaint> getComplaintById(@PathVariable("id") String id) {
        return ResponseEntity.status(200)
                .body(complaintRepository.findById(id).get());
    }

    @GetMapping("/admins")
    ResponseEntity<List<Complaint>> getComplaintsByAdminId() {
        return ResponseEntity.status(200)
                .body(complaintService.getComplaintsByAdminId());
    }

    @GetMapping("/users")
    ResponseEntity<List<Complaint>> getComplaintsByUserId() {
        return ResponseEntity.status(200)
                .body(complaintService.getComplaintsByUserId());
    }

    @PatchMapping("/admins/{id}/status")
    ResponseEntity<?> updateStatus(
            @PathVariable("id") String complaintId,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");

        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "status field is required"));
        }

        try {
            Complaint updated = complaintService.updateComplaintStatus(complaintId, status.toUpperCase());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
