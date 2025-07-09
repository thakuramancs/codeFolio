package com.codefolio.contestService.model;

import lombok.Data;
import java.util.List;

@Data
public class CodeChefContestList {
    private List<CodeChefContest> future;
    private List<CodeChefContest> present;
} 