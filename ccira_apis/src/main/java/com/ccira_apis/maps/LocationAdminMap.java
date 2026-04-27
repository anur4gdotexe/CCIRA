package com.ccira_apis.maps;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "location-admin_maps")
public class LocationAdminMap {
    public LocationAdminMap() {
    }

    @Id
    private String _id;

    private String state;

    private String district;

    @Field("admin_id")
    private String adminId;

    @Field("handles_road")
    private boolean handlesRoad;

    @Field("handles_sewage")
    private boolean handlesSewage;

    @Field("handles_waste")
    private boolean handlesWaste;

    @Field("handles_water")
    private boolean handlesWater;

    public boolean getHandlesRoad() {
        return handlesRoad;
    }

    public void setHandlesRoad(boolean handlesRoad) {
        this.handlesRoad = handlesRoad;
    }

    public boolean getHandlesSewage() {
        return handlesSewage;
    }

    public void setHandlesSewage(boolean handlesSewage) {
        this.handlesSewage = handlesSewage;
    }

    public boolean getHandlesWaste() {
        return handlesWaste;
    }

    public void setHandlesWaste(boolean handlesWaste) {
        this.handlesWaste = handlesWaste;
    }

    public boolean getHandlesWater() {
        return handlesWater;
    }

    public void setHandlesWater(boolean handlesWater) {
        this.handlesWater = handlesWater;
    }

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }
}
