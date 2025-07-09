package com.codefolio.contestService.service;

import com.codefolio.contestService.Clients.*;
import com.codefolio.contestService.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Comparator;
import java.time.Instant;

@Service
public class ContestServiceImpl implements ContestService {
    private static final Logger logger = LoggerFactory.getLogger(ContestServiceImpl.class);
    
    private final CodeforcesClient codeforcesClient;
    private final CodeChefClient codeChefClient;
    private final LeetCodeClient leetCodeClient;
    private final GFGClient gfgClient;
    private final HackerRankClient hackerRankClient;

    @Autowired
    public ContestServiceImpl(CodeforcesClient codeforcesClient, CodeChefClient codeChefClient, 
                            LeetCodeClient leetCodeClient, GFGClient gfgClient, 
                            HackerRankClient hackerRankClient) {
        this.codeforcesClient = codeforcesClient;
        this.codeChefClient = codeChefClient;
        this.leetCodeClient = leetCodeClient;
        this.gfgClient = gfgClient;
        this.hackerRankClient = hackerRankClient;
    }

    @Override
    @Cacheable(value = "activeContests", key = "'v2_active'", unless = "#result == null || #result.isEmpty()")
    public List<Contest> getActiveContests() {
        try {
            logger.info("Fetching active contests from APIs");
        List<Contest> contests = new ArrayList<>();
        fetchContests(contests, true);
            if (contests.isEmpty()) {
                logger.warn("No active contests found from any platform");
            }
        return sortContests(contests);
        } catch (Exception e) {
            logger.error("Error in getActiveContests: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    @Cacheable(value = "upcomingContests", key = "'v2_upcoming'", unless = "#result == null || #result.isEmpty()")
    public List<Contest> getUpcomingContests() {
        try {
            logger.info("Fetching upcoming contests from APIs");
        List<Contest> contests = new ArrayList<>();
        fetchContests(contests, false);
            if (contests.isEmpty()) {
                logger.warn("No upcoming contests found from any platform");
            }
        return sortContests(contests);
        } catch (Exception e) {
            logger.error("Error in getUpcomingContests: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    @Cacheable(value = "allContests", key = "'v2_all'", unless = "#result == null || #result.isEmpty()")
    public List<Contest> getAllContests() {
        try {
            logger.info("Fetching all contests from APIs");
        List<Contest> contests = new ArrayList<>();
        fetchContests(contests, null);
            if (contests.isEmpty()) {
                logger.warn("No contests found from any platform");
            }
        return sortContests(contests);
        } catch (Exception e) {
            logger.error("Error in getAllContests: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private List<Contest> sortContests(List<Contest> contests) {
        if (contests == null || contests.isEmpty()) {
            return new ArrayList<>();
        }
        return contests.stream()
            .sorted(Comparator.comparingLong(Contest::getStartTime))
            .collect(Collectors.toList());
    }

    private void fetchContests(List<Contest> contests, Boolean isActive) {
        long startTime = System.currentTimeMillis();
        logger.info("Starting to fetch contests from all platforms...");

        // Codeforces
        try {
            logger.debug("Fetching Codeforces contests...");
            CodeforcesResponse cfResponse = codeforcesClient.getContests();
            if (cfResponse != null && cfResponse.getResult() != null) {
                List<Contest> codeforcesContests = cfResponse.getResult().stream()
                    .filter(contest -> filterByPhase(contest.getPhase(), isActive))
                    .map(contest -> new Contest(
                        contest.getId(),
                        contest.getName(),
                        "Codeforces",
                        contest.getStartTimeSeconds() * 1000,
                        contest.getDurationSeconds() * 1000,
                        "https://codeforces.com/contests/" + contest.getId(),
                        "",
                        isActive ? "ACTIVE" : "UPCOMING"
                    ))
                    .collect(Collectors.toList());
                contests.addAll(codeforcesContests);
                logger.info("Successfully fetched {} Codeforces contests", codeforcesContests.size());
            }
        } catch (Exception e) {
            logger.error("Error fetching Codeforces contests: {}", e.getMessage(), e);
        }

        // CodeChef
        try {
            logger.debug("Fetching CodeChef contests...");
            CodeChefResponse ccResponse = codeChefClient.getActiveContests();
            if (ccResponse != null && ccResponse.getActiveContests() != null) {
                List<Contest> codechefContests = ccResponse.getActiveContests().stream()
                    .filter(contest -> filterByTime(contest.getStartTime(), System.currentTimeMillis(), isActive))
                    .collect(Collectors.toList());
                contests.addAll(codechefContests);
                logger.info("Successfully fetched {} CodeChef contests", codechefContests.size());
            }
        } catch (Exception e) {
            logger.error("Error fetching CodeChef contests: {}", e.getMessage(), e);
        }

        // LeetCode
        try {
            logger.debug("Fetching LeetCode contests...");
            String query = "{\"query\": \"{ allContests { title startTime duration titleSlug } }\"}";
            LeetCodeResponse lcResponse = leetCodeClient.getContests(query, "Mozilla/5.0");
            if (lcResponse != null && lcResponse.getData() != null && lcResponse.getData().getAllContests() != null) {
                long currentTime = System.currentTimeMillis() / 1000; // Current time in seconds
                List<Contest> leetcodeContests = lcResponse.getData().getAllContests().stream()
                    .filter(contest -> {
                        long contestStartTime = contest.getStartTime();
                        long contestEndTime = contestStartTime + (contest.getDuration() / 1000);
                        
                        if (isActive == null) {
                            return true; // Return all contests
                        } else if (isActive) {
                            // Active contests: Current time is between start and end time
                            return currentTime >= contestStartTime && currentTime <= contestEndTime;
                        } else {
                            // Upcoming contests: Start time is in the future
                            return contestStartTime > currentTime;
                        }
                    })
                    .map(contest -> new Contest(
                        contest.getTitleSlug().hashCode(),
                        contest.getTitle(),
                        "LeetCode",
                        contest.getStartTime() * 1000, // Convert to milliseconds
                        contest.getDuration(),
                        "https://leetcode.com/contest/" + contest.getTitleSlug(),
                        "",
                        isActive ? "ACTIVE" : "UPCOMING"
                    ))
                    .collect(Collectors.toList());
                contests.addAll(leetcodeContests);
                logger.info("Successfully fetched {} LeetCode contests", leetcodeContests.size());
            }
        } catch (Exception e) {
            logger.error("Error fetching LeetCode contests: {}", e.getMessage(), e);
        }

        // GeeksForGeeks
        try {
            logger.debug("Fetching GeeksForGeeks contests...");
            GFGResponse gfgResponse = gfgClient.getActiveContests();
            if (gfgResponse != null && gfgResponse.getActiveContests() != null) {
                List<Contest> gfgContests = gfgResponse.getActiveContests().stream()
                    .filter(contest -> isActive == null || contest.getStatus().equals(isActive ? "ACTIVE" : "UPCOMING"))
                    .collect(Collectors.toList());
                contests.addAll(gfgContests);
                logger.info("Successfully fetched {} GFG contests", gfgContests.size());
            }
        } catch (Exception e) {
            logger.error("Error fetching GFG contests: {}", e.getMessage(), e);
        }

        // HackerRank
        try {
            logger.debug("Fetching HackerRank contests...");
            HackerRankResponse hrResponse = isActive ? hackerRankClient.getActiveContests() : hackerRankClient.getUpcomingContests();
            if (hrResponse != null && hrResponse.getModels() != null) {
                List<Contest> hackerrankContests = hrResponse.getModels().stream()
                    .map(contest -> new Contest(
                        contest.getId(),
                        contest.getName(),
                        "HackerRank",
                        contest.getStartTime(),
                        contest.getDuration(),
                        contest.getUrl(),
                        contest.getDescription(),
                        isActive ? "ACTIVE" : "UPCOMING"
                    ))
                    .collect(Collectors.toList());
                contests.addAll(hackerrankContests);
                logger.info("Successfully fetched {} HackerRank contests", hackerrankContests.size());
            }
        } catch (Exception e) {
            logger.error("Error fetching HackerRank contests: {}", e.getMessage(), e);
        }

        long endTime = System.currentTimeMillis();
        logger.info("Finished fetching all contests in {} ms. Total contests: {}", 
            (endTime - startTime), contests.size());
    }

    private boolean filterByPhase(String phase, Boolean isActive) {
        if (isActive == null) return true;
        return isActive ? phase.equals("CODING") : phase.equals("BEFORE");
    }

    private boolean filterByTime(long startTime, long currentTime, Boolean isActive) {
        if (isActive == null) return true;
        return isActive ? startTime <= currentTime : startTime > currentTime;
    }
} 