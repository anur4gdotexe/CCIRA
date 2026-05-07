package com.ccira_apis.admin_bodies;

import com.ccira_apis.complaints.ComplaintService;
import com.ccira_apis.users.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/admins")
public class AdminBodyController {
    private final ComplaintService complaintService;
    private final AdminBodyService adminBodyService;
    private final UserService userService;

    public AdminBodyController(ComplaintService complaintService,
                               AdminBodyService adminBodyService,
                               UserService userService) {
        this.complaintService = complaintService;
        this.adminBodyService = adminBodyService;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe() {
        return ResponseEntity.ok(adminBodyService.getMe());
    }
}
