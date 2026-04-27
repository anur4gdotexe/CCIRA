package com.ccira_apis.admin_bodies;

import com.ccira_apis.complaints.ComplaintService;
import com.ccira_apis.users.UserService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admins")
public class AdminBodyController {
    private ComplaintService complaintService;
    private AdminBodyService adminBodyService;
    private UserService userService;

    public AdminBodyController(ComplaintService complaintService, AdminBodyService adminBodyService, UserService userService) {
        this.complaintService = complaintService;
        this.adminBodyService = adminBodyService;
        this.userService = userService;
    }
}
