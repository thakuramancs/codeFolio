package com.codefolio.contestService.model;

import lombok.Data;
import lombok.EqualsAndHashCode;


@Data
@EqualsAndHashCode(callSuper = true)
public class GFGContest extends Contest {
    private String description;
    private String status;
    
    public GFGContest() {
        super();
    }
    
    public GFGContest(int id, String name, String platform, long startTime, long duration, String url, String description, String status) {
        super(id, name, platform, startTime, duration, url, description, status);
        this.description = description;
        this.status = status;
    }
} 