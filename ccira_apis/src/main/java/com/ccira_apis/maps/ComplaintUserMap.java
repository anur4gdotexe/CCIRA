package com.ccira_apis.maps;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "complaints-user_maps")
public class ComplaintUserMap {
    @Id
    private String _id;

    @Field("complaint_id")
    private String complaintId;

    @Field("user_id")
    private String userId;

    public ComplaintUserMap(String complaintId, String userId) {
        this.complaintId = complaintId;
        this.userId = userId;
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
