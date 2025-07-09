package com.codefolio.contestService.model;

import lombok.Data;
import java.util.List;

@Data
public class GFGResponse {
    private List<GFGContest> activeContests;
    private String status;
    private String message;
} 