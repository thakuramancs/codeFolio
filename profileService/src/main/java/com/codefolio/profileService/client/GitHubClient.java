package com.codefolio.profileService.client;

import com.codefolio.profileService.dto.GitHubStatsDTO;
import com.codefolio.profileService.dto.GitHubStatsDTO.ContributionDay;
import org.kohsuke.github.*;
import org.springframework.stereotype.Component;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.json.JSONObject;
import org.json.JSONArray;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class GitHubClient {
    private static final Logger log = LoggerFactory.getLogger(GitHubClient.class);
    private final GitHub github;
    private final RestTemplate restTemplate;
    private final String token;
    private static final String GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

    public GitHubClient(@Value("${github.token:}") String token) throws IOException {
        this.token = token;
        if (token == null || token.trim().isEmpty()) {
            log.error("GitHub token is not configured. Please set the github.token property or GITHUB_TOKEN environment variable.");
            throw new IllegalStateException("GitHub token is not configured");
        }
        
        try {
            log.info("Initializing GitHub client");
            this.github = new GitHubBuilder()
                .withOAuthToken(token)
                .build();
            
            // Validate token by making a test request
            try {
                github.getMyself();
                log.info("Successfully validated GitHub token");
            } catch (IOException e) {
                log.error("Failed to validate GitHub token: {}", e.getMessage());
                throw new IllegalStateException("Invalid GitHub token: " + e.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to initialize GitHub client: {}", e.getMessage());
            throw new IllegalStateException("Failed to initialize GitHub client: " + e.getMessage());
        }
        
        this.restTemplate = new RestTemplate();
    }

    public GitHubStatsDTO getUserProfile(String username) {
        try {
            log.info("Starting to fetch GitHub profile for username: {}", username);
            
            if (username == null || username.trim().isEmpty()) {
                log.error("GitHub username is null or empty");
                throw new IllegalArgumentException("GitHub username cannot be empty");
            }

            log.debug("Attempting to connect to GitHub API with token: {}", token != null ? "present" : "missing");
            GHUser user = github.getUser(username);
            log.info("Successfully retrieved GitHub user: {}", username);
            GitHubStatsDTO stats = new GitHubStatsDTO();
            
            // Basic user info
            try {
                stats.setPublicRepos(user.getPublicRepoCount());
                stats.setFollowers(user.getFollowersCount());
                stats.setFollowing(user.getFollowingCount());
                log.info("Successfully set basic user info for: {}", username);
            } catch (Exception e) {
                log.error("Error setting basic user info: {}", e.getMessage(), e);
                throw e;
            }

            // Repository stats
            int totalStars = 0;
            Map<String, Long> languageBytes = new HashMap<>();
            
            try {
                List<GHRepository> repos = user.listRepositories().toList();
                for (GHRepository repo : repos) {
                    totalStars += repo.getStargazersCount();
                
                    // Aggregate language statistics
                    try {
                        Map<String, Long> repoLanguages = repo.listLanguages();
                        repoLanguages.forEach((lang, bytes) -> 
                            languageBytes.merge(lang, bytes, Long::sum));
                    } catch (Exception e) {
                        log.warn("Error fetching languages for repo {}: {}", repo.getName(), e.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("Error fetching repositories: {}", e.getMessage());
            }
            
            stats.setTotalStars(totalStars);

            // Calculate language percentages
            long totalBytes = languageBytes.values().stream().mapToLong(Long::longValue).sum();
            Map<String, Double> languagePercentages = new HashMap<>();
            if (totalBytes > 0) {
                languageBytes.forEach((lang, bytes) -> {
                    double percentage = (bytes.doubleValue() / totalBytes) * 100;
                    languagePercentages.put(lang, Math.round(percentage * 10.0) / 10.0); // Round to 1 decimal
                });
            }
            stats.setLanguages(languagePercentages);

            // Fetch detailed contribution data using GraphQL
            String graphqlQuery = "query { " +
                "user(login: \"" + username + "\") { " +
                "contributionsCollection { " +
                "totalCommitContributions " +
                "totalIssueContributions " +
                "totalPullRequestContributions " +
                "contributionCalendar { " +
                "totalContributions " +
                "weeks { " +
                "contributionDays { " +
                "contributionCount " +
                "date " +
                "} " +
                "} " +
                "} " +
                "} " +
                "} " +
                "}";

            String query = "{\"query\": \"" + graphqlQuery.replace("\"", "\\\"") + "\"}";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "CodeFolio-App");

            HttpEntity<String> entity = new HttpEntity<>(query, headers);
            
            try {
                ResponseEntity<String> response = restTemplate.exchange(
                    GITHUB_GRAPHQL_URL,
                    HttpMethod.POST,
                    entity,
                    String.class
                );

                JSONObject responseData = new JSONObject(response.getBody());
                
                // Check for GraphQL errors
                if (responseData.has("errors")) {
                    JSONArray errors = responseData.getJSONArray("errors");
                    StringBuilder errorMsg = new StringBuilder();
                    for (int i = 0; i < errors.length(); i++) {
                        errorMsg.append(errors.getJSONObject(i).getString("message")).append("; ");
                    }
                    throw new RuntimeException("GraphQL errors: " + errorMsg);
                }

                JSONObject data = responseData.getJSONObject("data").getJSONObject("user");
                JSONObject contributions = data.getJSONObject("contributionsCollection");
                
                // Set contribution stats
                int totalCommits = contributions.getInt("totalCommitContributions");
                int totalPRs = contributions.getInt("totalPullRequestContributions");
                int totalIssues = contributions.getInt("totalIssueContributions");
                
                stats.setPrs(totalPRs);
                stats.setIssues(totalIssues);
                stats.setCommits(totalCommits);
                stats.setTotalContributions(totalPRs + totalIssues + totalCommits);

                // Process contribution calendar
                JSONObject calendar = contributions.getJSONObject("contributionCalendar");
                JSONArray weeks = calendar.getJSONArray("weeks");
                
                List<ContributionDay> contributionDays = new ArrayList<>();
                Set<LocalDate> activeDays = new HashSet<>();
                int currentStreak = 0;
                int maxStreak = 0;
                int tempStreak = 0;

                for (int i = 0; i < weeks.length(); i++) {
                    JSONArray days = weeks.getJSONObject(i).getJSONArray("contributionDays");
                    for (int j = 0; j < days.length(); j++) {
                        JSONObject day = days.getJSONObject(j);
                        String date = day.getString("date");
                        int count = day.getInt("contributionCount");
                        
                        ContributionDay contributionDay = new ContributionDay();
                        contributionDay.setDate(date);
                        contributionDay.setCount(count);
                        contributionDays.add(contributionDay);

                        if (count > 0) {
                            LocalDate contributionDate = LocalDate.parse(date);
                            activeDays.add(contributionDate);
                            tempStreak++;
                            maxStreak = Math.max(maxStreak, tempStreak);
                            
                            if (contributionDate.equals(LocalDate.now()) || 
                                contributionDate.equals(LocalDate.now().minusDays(1))) {
                                currentStreak = tempStreak;
                            }
                        } else {
                            tempStreak = 0;
                        }
                    }
                }

                stats.setContributionCalendar(contributionDays);
                stats.setTotalActiveDays(activeDays.size());
                stats.setCurrentStreak(currentStreak);
                stats.setMaxStreak(maxStreak);
            } catch (Exception e) {
                log.error("Error fetching contribution data: {}", e.getMessage());
                // Set default values for contribution data
                stats.setTotalContributions(0);
                stats.setTotalActiveDays(0);
                stats.setCurrentStreak(0);
                stats.setMaxStreak(0);
                stats.setPrs(0);
                stats.setIssues(0);
                stats.setCommits(0);
                stats.setContributionCalendar(new ArrayList<>());
            }
            
            return stats;
        } catch (Exception e) {
            log.error("Error fetching GitHub profile for username: {}", username, e);
            throw new RuntimeException("Failed to fetch GitHub profile: " + e.getMessage());
        }
    }
} 