package com.codefolio.contestService.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder(access = AccessLevel.PUBLIC)
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PUBLIC)
public class Contest {
    private int id;
    private String name;
    private String platform;
    private long startTime;
    private long duration;
    private String url;
    private String description;
    private String status;
}