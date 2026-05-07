package com.ccira_apis.counter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "counters")
public class Counter {

    @Id
    private String id;

    @Field("count")
    private int count;

    public Counter() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
}
