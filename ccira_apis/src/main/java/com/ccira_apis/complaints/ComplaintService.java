package com.ccira_apis.complaints;

import com.ccira_apis.admin_bodies.AdminBodyRepository;
import com.ccira_apis.maps.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;

import static java.util.stream.Collectors.toList;

@Service
public class ComplaintService {
    private static final Set<String> VALID_STATUSES = Set.of("SUBMITTED", "ACCEPTED", "DECLINED", "RESOLVED");

    private final ComplaintRepository complaintRepository;
    private final LocationAdminService locationAdminService;
    private final ComplaintUserRepository complaintUserRepository;
    private final ComplaintAdminRepository complaintAdminRepository;
    private final ComplaintsCounterService complaintsCounterService;
    private final AdminBodyRepository adminBodyRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            LocationAdminService locationAdminService,
                            ComplaintAdminRepository complaintAdminRepository,
                            ComplaintUserRepository complaintUserRepository,
                            ComplaintsCounterService complaintsCounterService,
                            AdminBodyRepository adminBodyRepository) {
        this.complaintRepository = complaintRepository;
        this.locationAdminService = locationAdminService;
        this.complaintAdminRepository = complaintAdminRepository;
        this.complaintUserRepository = complaintUserRepository;
        this.complaintsCounterService = complaintsCounterService;
        this.adminBodyRepository = adminBodyRepository;
    }

    public Complaint addComplaint(ComplaintSubmissionDTO complaintSubmissionDTO) {
        String category = complaintSubmissionDTO.getCategory();

        List<String> adminIds = locationAdminService.getAdminIds(
                complaintSubmissionDTO.getState(),
                complaintSubmissionDTO.getDistrict(),
                category,
                complaintSubmissionDTO.getLat(),
                complaintSubmissionDTO.getLon());

//        System.out.println("\n\n" + adminIds.toString() + "\n\n");
        if (adminIds.isEmpty()) {
            throw new RuntimeException("area not serviceable");
        }

        String complaintId = complaintsCounterService.generateComplaintId();

        String now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS).toString();

        Complaint newComplaint = new Complaint();
        newComplaint.setComplaintId(complaintId);
        newComplaint.setDescription(complaintSubmissionDTO.getDescription());
        newComplaint.setCategory(category);
        newComplaint.setLat(complaintSubmissionDTO.getLat());
        newComplaint.setLon(complaintSubmissionDTO.getLon());
        newComplaint.setImgSrc(complaintSubmissionDTO.getImage());
        newComplaint.setStatus("SUBMITTED");
        newComplaint.setCreatedAt(now);
        newComplaint.setName(complaintSubmissionDTO.getName());
        newComplaint.setPhone(complaintSubmissionDTO.getPhone());

        List<StatusEvent> history = new ArrayList<>();
        history.add(new StatusEvent("SUBMITTED", now));
        newComplaint.setStatusHistory(history);

        String userId = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        List<ComplaintAdminMap> complaintAdminMaps = adminIds.stream()
                        .map(adminId -> new ComplaintAdminMap(complaintId, adminId))
                        .toList();

        complaintRepository.save(newComplaint);
        complaintUserRepository.save(new ComplaintUserMap(complaintId, userId));
        complaintAdminRepository.saveAll(complaintAdminMaps);

        return newComplaint;
    }

    public Optional<Complaint> removeComplaint(String complaintId) {
        Optional<Complaint> complaint = complaintRepository.findById(complaintId);

        complaintRepository.deleteById(complaintId);
        complaintAdminRepository.deleteAllByComplaintId(complaintId);
        complaintUserRepository.deleteAllByComplaintId(complaintId);

        return complaint;
    }

    public List<Complaint> getComplaintsByAdminId() {
        String adminId = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return complaintAdminRepository.findByAdminId(adminId).stream()
                .map(cam -> complaintRepository.findById(cam.getComplaintId())
                        .orElseThrow(() -> new NoSuchElementException("Complaint not found: " + cam.getComplaintId())))
                .map(complaint -> {
                    complaint.setAdmin(getAdminByComplaintId(complaint.getComplaintId()));
                    return complaint;
                })
                .toList();
    }

    public List<Complaint> getComplaintsByUserId() {
        String userId = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return complaintUserRepository.findByUserId(userId).stream()
                .map(cum -> complaintRepository.findById(cum.getComplaintId())
                        .orElseThrow(() -> new NoSuchElementException("Complaint not found: " + cum.getComplaintId())))
                .map(complaint -> {
                    complaint.setAdmin(getAdminByComplaintId(complaint.getComplaintId()));
                    return complaint;
                })
                .toList();
    }

    public Complaint updateComplaintStatus(String complaintId, String newStatus) {
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid status: " + newStatus +
                    ". Must be one of: SUBMITTED, ACCEPTED, DECLINED, RESOLVED");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + complaintId));

        String now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS).toString();

        complaint.setStatus(newStatus);
        complaint.setUpdatedAt(now);

        List<StatusEvent> history = complaint.getStatusHistory();
        if (history == null) {
            history = new ArrayList<>();
        }
        history.add(new StatusEvent(newStatus, now));
        complaint.setStatusHistory(history);

        complaintRepository.save(complaint);

        return complaint;
    }

    public String getAdminByComplaintId(String complaintId) {
        String adminId = complaintAdminRepository.findByComplaintId(complaintId)
                .stream().findFirst()
                .orElseThrow(() -> new NoSuchElementException("No admin mapping found for complaint: " + complaintId))
                .getAdminId();
        return adminBodyRepository.findById(adminId)
                .orElseThrow(() -> new NoSuchElementException("Admin body not found: " + adminId))
                .getAdminName();
    }
}
