package com.codefolio.contestService.model;

import lombok.Data;

@Data
public class LeetCodeContest {
    private String title;
    private Long startTime;
    private Long duration;
    private String titleSlug;
} 