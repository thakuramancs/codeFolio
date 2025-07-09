package com.codefolio.contestService.model;

import lombok.Data;

@Data
public class CodeforcesContest {
    private int id;
    private String name;
    private String phase;
    private long startTimeSeconds;
    private long durationSeconds;
} 