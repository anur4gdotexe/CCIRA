package com.ccira_apis.complaints;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "complaints_counter")
public class ComplaintsCounter {
    @Id
    private String _id;

    @Field("complaints_count")
    private int complaintCount;

//    @Field("custom_field")
//    private String customField;

//    public String getCustomField() {
//        return customField;
//    }
//
//    public void setCustomField(String customField) {
//        this.customField = customField;
//    }

    public ComplaintsCounter () {
    }

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public int getComplaintCount() {
        return complaintCount;
    }

    public void setComplaintCount(int complaintCount) {
        this.complaintCount = complaintCount;
    }
}
