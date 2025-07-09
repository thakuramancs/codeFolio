package com.codefolio.contestService.model;

import lombok.Data;
import java.util.List;

@Data
public class HackerRankResponse {
    private List<HackerRankContest> models;
    private String status;
    private String message;
} 