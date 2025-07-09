package com.codefolio.contestService.service;

import com.codefolio.contestService.model.Contest;
import java.util.List;

public interface ContestService {
    List<Contest> getActiveContests();
    List<Contest> getUpcomingContests();
    List<Contest> getAllContests();
} 