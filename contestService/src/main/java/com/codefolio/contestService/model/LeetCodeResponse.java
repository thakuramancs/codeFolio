package com.codefolio.contestService.model;

import lombok.Data;
import java.util.List;

@Data
public class LeetCodeResponse {
    private Data data;

    @lombok.Data
    public static class Data {
        private List<LeetCodeContest> allContests;
    }
} 