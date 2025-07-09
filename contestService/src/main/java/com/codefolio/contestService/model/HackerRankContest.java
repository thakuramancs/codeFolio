package com.codefolio.contestService.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;


@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class HackerRankContest extends Contest {
    private String description;
    private String status;
    
    public HackerRankContest(int id, String name, String platform, long startTime, long duration, String url, String description, String status) {
        super(id, name, platform, startTime, duration, url, description, status);
    }
} 