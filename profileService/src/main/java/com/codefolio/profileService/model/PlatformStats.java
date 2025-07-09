package com.codefolio.profileService.model;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;
import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Embeddable
@JsonIgnoreProperties(ignoreUnknown = true)
public class PlatformStats implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer totalQuestions = 0;
    private Integer totalActiveDays = 0;
    private Integer totalContests = 0;
    private Integer rating = 0;
    private Integer contestRanking = 0;

    @ElementCollection
    @CollectionTable(
        name = "difficulty_wise_solved",
        joinColumns = @JoinColumn(name = "profile_id")
    )
    @MapKeyColumn(name = "difficulty")
    @Column(name = "count")
    private Map<String, Integer> difficultyWiseSolved = new HashMap<>();

    @ElementCollection
    @CollectionTable(
        name = "topic_wise_solved",
        joinColumns = @JoinColumn(name = "profile_id")
    )
    @MapKeyColumn(name = "topic")
    @Column(name = "count")
    private Map<String, Integer> topicWiseSolved = new HashMap<>();

    @Column(columnDefinition = "TEXT")
    private String submissionCalendar;

    @Column(columnDefinition = "TEXT")
    private String awards;

    // Default constructor
    public PlatformStats() {
        this.difficultyWiseSolved = new HashMap<>();
        this.topicWiseSolved = new HashMap<>();
    }

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

    public Map<String, Integer> getDifficultyWiseSolved() { 
        return difficultyWiseSolved != null ? difficultyWiseSolved : new HashMap<>(); 
    }
    public void setDifficultyWiseSolved(Map<String, Integer> difficultyWiseSolved) { 
        this.difficultyWiseSolved = difficultyWiseSolved != null ? difficultyWiseSolved : new HashMap<>(); 
    }

    public Map<String, Integer> getTopicWiseSolved() { 
        return topicWiseSolved != null ? topicWiseSolved : new HashMap<>(); 
    }
    public void setTopicWiseSolved(Map<String, Integer> topicWiseSolved) { 
        this.topicWiseSolved = topicWiseSolved != null ? topicWiseSolved : new HashMap<>(); 
    }

    public String getSubmissionCalendar() { return submissionCalendar; }
    public void setSubmissionCalendar(String submissionCalendar) { 
        this.submissionCalendar = submissionCalendar; 
    }

    public String getAwards() { return awards; }
    public void setAwards(String awards) { this.awards = awards; }
} 