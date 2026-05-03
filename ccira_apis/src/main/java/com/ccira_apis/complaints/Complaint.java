package com.ccira_apis.complaints;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "complaints")
public class Complaint {
    @Id
    private String complaintId;

    @Field("description")
    private String description;

    @Field("category")
    private String category;

    @Field("img_src")
    private String imgSrc;

    @Field("created_at")
    private String createdAt;

    @Field("updated_at")
    private String updatedAt;

    @Field("status")
    private String status;

    @Field("status_history")
    private List<StatusEvent> statusHistory = new ArrayList<>();

    @Field("lat")
    private double lat;

    @Field("lon")
    private double lon;

    @Field("name")
    private String name;

    private String admin;

    public String getAdmin() {
        return admin;
    }

    public void setAdmin(String admin) {
        this.admin = admin;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @Field("phone")
    private String phone;

    public Complaint() {
    }

    public String getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(String complaintId) {
        this.complaintId = complaintId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImgSrc() {
        return imgSrc;
    }

    public void setImgSrc(String imgSrc) {
        this.imgSrc = imgSrc;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLon() {
        return lon;
    }

    public void setLon(double lon) {
        this.lon = lon;
    }

    public String getStatus() { return status; }

    public void setStatus(String status) { this.status = status; }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<StatusEvent> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<StatusEvent> statusHistory) {
        this.statusHistory = statusHistory;
    }
}
