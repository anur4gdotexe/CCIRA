package com.ccira_apis.maps;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "complaints-admin_maps")
public class ComplaintAdminMap {
    @Id
    private String _id;

    @Field("complaint_id")
    private String complaintId;

    @Field("admin_id")
    private String adminId;

    public ComplaintAdminMap(String complaintId, String adminId) {
        this.complaintId = complaintId;
        this.adminId = adminId;
    }

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(String complaintId) {
        this.complaintId = complaintId;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }
}
