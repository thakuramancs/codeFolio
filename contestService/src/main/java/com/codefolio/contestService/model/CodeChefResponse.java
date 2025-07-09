package com.codefolio.contestService.model;

import lombok.Data;
import java.util.List;

@Data
public class CodeChefResponse {
    private List<CodeChefContest> activeContests;
    private String status;
    private String message;
} 