package com.codefolio.profileService.model;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "profiles")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Profile implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String userId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    // Platform usernames
    private String leetcodeUsername;
    private String codeforcesUsername;
    private String codechefUsername;
    private String atcoderUsername;
    private String geeksforgeeksUsername;
    private String githubUsername;

    // Platform statistics
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "totalQuestions", column = @Column(name = "leetcode_total_questions")),
        @AttributeOverride(name = "totalActiveDays", column = @Column(name = "leetcode_active_days")),
        @AttributeOverride(name = "totalContests", column = @Column(name = "leetcode_total_contests")),
        @AttributeOverride(name = "rating", column = @Column(name = "leetcode_rating")),
        @AttributeOverride(name = "contestRanking", column = @Column(name = "leetcode_contest_ranking")),
        @AttributeOverride(name = "submissionCalendar", column = @Column(name = "leetcode_submission_calendar", columnDefinition = "TEXT")),
        @AttributeOverride(name = "awards", column = @Column(name = "leetcode_awards", columnDefinition = "TEXT"))
    })
    private PlatformStats leetcodeStats = new PlatformStats();

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "totalQuestions", column = @Column(name = "codeforces_total_questions")),
        @AttributeOverride(name = "totalActiveDays", column = @Column(name = "codeforces_active_days")),
        @AttributeOverride(name = "totalContests", column = @Column(name = "codeforces_total_contests")),
        @AttributeOverride(name = "rating", column = @Column(name = "codeforces_rating")),
        @AttributeOverride(name = "contestRanking", column = @Column(name = "codeforces_contest_ranking")),
        @AttributeOverride(name = "submissionCalendar", column = @Column(name = "codeforces_submission_calendar", columnDefinition = "TEXT")),
        @AttributeOverride(name = "awards", column = @Column(name = "codeforces_awards", columnDefinition = "TEXT"))
    })
    private PlatformStats codeforcesStats = new PlatformStats();

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "totalQuestions", column = @Column(name = "codechef_total_questions")),
        @AttributeOverride(name = "totalActiveDays", column = @Column(name = "codechef_active_days")),
        @AttributeOverride(name = "totalContests", column = @Column(name = "codechef_total_contests")),
        @AttributeOverride(name = "rating", column = @Column(name = "codechef_rating")),
        @AttributeOverride(name = "contestRanking", column = @Column(name = "codechef_contest_ranking")),
        @AttributeOverride(name = "submissionCalendar", column = @Column(name = "codechef_submission_calendar", columnDefinition = "TEXT")),
        @AttributeOverride(name = "awards", column = @Column(name = "codechef_awards", columnDefinition = "TEXT"))
    })
    private PlatformStats codechefStats = new PlatformStats();

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "totalQuestions", column = @Column(name = "atcoder_total_questions")),
        @AttributeOverride(name = "totalActiveDays", column = @Column(name = "atcoder_active_days")),
        @AttributeOverride(name = "totalContests", column = @Column(name = "atcoder_total_contests")),
        @AttributeOverride(name = "rating", column = @Column(name = "atcoder_rating")),
        @AttributeOverride(name = "contestRanking", column = @Column(name = "atcoder_contest_ranking")),
        @AttributeOverride(name = "submissionCalendar", column = @Column(name = "atcoder_submission_calendar", columnDefinition = "TEXT")),
        @AttributeOverride(name = "awards", column = @Column(name = "atcoder_awards", columnDefinition = "TEXT"))
    })
    private PlatformStats atcoderStats = new PlatformStats();

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "totalQuestions", column = @Column(name = "geeksforgeeks_total_questions")),
        @AttributeOverride(name = "totalActiveDays", column = @Column(name = "geeksforgeeks_active_days")),
        @AttributeOverride(name = "totalContests", column = @Column(name = "geeksforgeeks_total_contests")),
        @AttributeOverride(name = "rating", column = @Column(name = "geeksforgeeks_rating")),
        @AttributeOverride(name = "contestRanking", column = @Column(name = "geeksforgeeks_contest_ranking")),
        @AttributeOverride(name = "submissionCalendar", column = @Column(name = "geeksforgeeks_submission_calendar", columnDefinition = "TEXT")),
        @AttributeOverride(name = "awards", column = @Column(name = "geeksforgeeks_awards", columnDefinition = "TEXT"))
    })
    private PlatformStats geeksforgeeksStats = new PlatformStats();

    // GitHub stats
    private Integer githubRepos;
    private Integer githubStars;
    private Integer githubFollowers;
    private Integer githubFollowing;

    private LocalDateTime lastUpdated;

    @PrePersist
    protected void onCreate() {
        lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    public Profile() {}

    public Profile(String userId, String email, String name) {
        this.userId = userId;
        this.email = email;
        this.name = name;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLeetcodeUsername() { return leetcodeUsername; }
    public void setLeetcodeUsername(String leetcodeUsername) { this.leetcodeUsername = leetcodeUsername; }

    public String getCodeforcesUsername() { return codeforcesUsername; }
    public void setCodeforcesUsername(String codeforcesUsername) { this.codeforcesUsername = codeforcesUsername; }

    public String getCodechefUsername() { return codechefUsername; }
    public void setCodechefUsername(String codechefUsername) { this.codechefUsername = codechefUsername; }

    public String getAtcoderUsername() { return atcoderUsername; }
    public void setAtcoderUsername(String atcoderUsername) { this.atcoderUsername = atcoderUsername; }

    public String getGeeksforgeeksUsername() { return geeksforgeeksUsername; }
    public void setGeeksforgeeksUsername(String geeksforgeeksUsername) { this.geeksforgeeksUsername = geeksforgeeksUsername; }

    public PlatformStats getLeetcodeStats() { return leetcodeStats; }
    public void setLeetcodeStats(PlatformStats leetcodeStats) { this.leetcodeStats = leetcodeStats; }

    public PlatformStats getCodeforcesStats() { return codeforcesStats; }
    public void setCodeforcesStats(PlatformStats codeforcesStats) { this.codeforcesStats = codeforcesStats; }

    public PlatformStats getCodechefStats() { return codechefStats; }
    public void setCodechefStats(PlatformStats codechefStats) { this.codechefStats = codechefStats; }

    public PlatformStats getAtcoderStats() { return atcoderStats; }
    public void setAtcoderStats(PlatformStats atcoderStats) { this.atcoderStats = atcoderStats; }

    public PlatformStats getGeeksforgeeksStats() { return geeksforgeeksStats; }
    public void setGeeksforgeeksStats(PlatformStats geeksforgeeksStats) { this.geeksforgeeksStats = geeksforgeeksStats; }

    public String getGithubUsername() {
        return githubUsername;
    }

    public void setGithubUsername(String githubUsername) {
        this.githubUsername = githubUsername;
    }

    public Integer getGithubRepos() {
        return githubRepos;
    }

    public void setGithubRepos(Integer githubRepos) {
        this.githubRepos = githubRepos;
    }

    public Integer getGithubStars() {
        return githubStars;
    }

    public void setGithubStars(Integer githubStars) {
        this.githubStars = githubStars;
    }

    public Integer getGithubFollowers() {
        return githubFollowers;
    }

    public void setGithubFollowers(Integer githubFollowers) {
        this.githubFollowers = githubFollowers;
    }

    public Integer getGithubFollowing() {
        return githubFollowing;
    }

    public void setGithubFollowing(Integer githubFollowing) {
        this.githubFollowing = githubFollowing;
    }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
} 