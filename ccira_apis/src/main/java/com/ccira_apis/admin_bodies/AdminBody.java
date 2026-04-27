package com.ccira_apis.admin_bodies;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "admin_bodies")
public class AdminBody {
    @Id
    private String adminId;

    @Field("admin_name")
    private String adminName;

    @Field("admin_password")
    private String password;

    @Field("email")
    private String email;

    @Field("website_url")
    private String websiteUrl;

    @Field("grievance_portal")
    private String grievancePortal;

    public AdminBody() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public String getGrievancePortal() {
        return grievancePortal;
    }

    public void setGrievancePortal(String grievancePortal) {
        this.grievancePortal = grievancePortal;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }
}
