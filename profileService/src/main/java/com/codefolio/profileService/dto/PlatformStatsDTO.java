package com.codefolio.profileService.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlatformStatsDTO {
    private Integer totalQuestions;
    private Integer totalActiveDays;
    private Integer totalContests;
    private Integer rating;
    private Integer contestRanking;
    private Map<String, Integer> difficultyWiseSolved;
    private Map<String, Integer> topicWiseSolved;
    private String submissionCalendar;
    private String awards;

    // Default constructor
    public PlatformStatsDTO() {}

    // Getters and Setters
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getTotalActiveDays() { return totalActiveDays; }
    public void setTotalActiveDays(Integer totalActiveDays) { this.totalActiveDays = totalActiveDays; }

    public Integer getTotalContests() { return totalContests; }
    public void setTotalContests(Integer totalContests) { this.totalContests = totalContests; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public Integer getContestRanking() { return contestRanking; }
    public void setContestRanking(Integer contestRanking) { this.contestRanking = contestRanking; }

    public Map<String, Integer> getDifficultyWiseSolved() { return difficultyWiseSolved; }
    public void setDifficultyWiseSolved(Map<String, Integer> difficultyWiseSolved) { 
        this.difficultyWiseSolved = difficultyWiseSolved; 
    }

    public Map<String, Integer> getTopicWiseSolved() { return topicWiseSolved; }
    public void setTopicWiseSolved(Map<String, Integer> topicWiseSolved) { 
        this.topicWiseSolved = topicWiseSolved; 
    }

    public String getSubmissionCalendar() { return submissionCalendar; }
    public void setSubmissionCalendar(String submissionCalendar) { 
        this.submissionCalendar = submissionCalendar; 
    }

    public String getAwards() { return awards; }
    public void setAwards(String awards) { this.awards = awards; }
} 