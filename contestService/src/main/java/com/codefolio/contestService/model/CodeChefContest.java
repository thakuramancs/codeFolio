package com.codefolio.contestService.model;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class CodeChefContest extends Contest {
    public CodeChefContest(int id, String name, String platform, long startTime, long duration, String url, String description, String status) {
        super(id, name, platform, startTime, duration, url, description, status);
    }
} 