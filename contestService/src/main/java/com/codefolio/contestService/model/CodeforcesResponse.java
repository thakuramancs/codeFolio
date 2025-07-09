package com.codefolio.contestService.model;

import lombok.Data;
import java.util.List;

@Data
public class CodeforcesResponse {
    private String status;
    private List<CodeforcesContest> result;
} 