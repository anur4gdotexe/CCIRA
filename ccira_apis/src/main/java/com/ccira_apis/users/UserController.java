package com.ccira_apis.users;

import com.ccira_apis.admin_bodies.AdminBodyService;
import com.ccira_apis.complaints.ComplaintService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {
    private ComplaintService complaintService;
    private AdminBodyService adminBodyService;
    private UserService userService;

    public UserController(ComplaintService complaintService, AdminBodyService adminBodyService, UserService userService) {
        this.complaintService = complaintService;
        this.adminBodyService = adminBodyService;
        this.userService = userService;
    }
}
