package com.codefolio.profileService.controller;

import com.codefolio.profileService.model.Profile;
import com.codefolio.profileService.model.PlatformStats;
import com.codefolio.profileService.dto.PlatformStatsDTO;
import com.codefolio.profileService.service.ProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashMap;
import com.codefolio.profileService.client.GeeksForGeeksClient;
import com.codefolio.profileService.client.LeetCodeClient;
import com.codefolio.profileService.client.CodeforcesClient;
import com.codefolio.profileService.client.CodeChefClient;
import java.util.Objects;
import com.codefolio.profileService.client.GitHubClient;
import com.codefolio.profileService.dto.GitHubStatsDTO;

@RestController
@RequestMapping("/profiles")
public class ProfileController {

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);
    private final ProfileService profileService;
    private final GeeksForGeeksClient geeksForGeeksClient;
    private final LeetCodeClient leetCodeClient;
    private final CodeforcesClient codeforcesClient;
    private final CodeChefClient codeChefClient;
    private final GitHubClient gitHubClient;

    public ProfileController(ProfileService profileService, GeeksForGeeksClient geeksForGeeksClient, LeetCodeClient leetCodeClient, CodeforcesClient codeforcesClient, CodeChefClient codeChefClient, GitHubClient gitHubClient) {
        this.profileService = profileService;
        this.geeksForGeeksClient = geeksForGeeksClient;
        this.leetCodeClient = leetCodeClient;
        this.codeforcesClient = codeforcesClient;
        this.codeChefClient = codeChefClient;
        this.gitHubClient = gitHubClient;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId, @RequestParam(required = false) String email, @RequestParam(required = false) String name) {
        try {
            // Try to get or create the profile if not found
            Profile refreshedProfile;
            try {
                refreshedProfile = profileService.updateProfile(userId);
            } catch (Exception e) {
                // If not found, create a new profile if email and name are provided
                if ((e.getMessage() != null && (e.getMessage().toLowerCase().contains("not found") || e.getMessage().toLowerCase().contains("no value present") || e.getMessage().toLowerCase().contains("profile does not exist")))
                    && email != null && name != null) {
                    refreshedProfile = profileService.createProfile(userId, email, name);
                } else {
                    throw e;
                }
            }
            return ResponseEntity.ok(refreshedProfile);
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (msg.contains("not found") || msg.contains("no value present") || msg.contains("profile does not exist")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Profile not found", "message", "No profile exists for this user ID"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Profile> createProfile(
            @RequestParam String userId,
            @RequestParam String email,
            @RequestParam String name) {
        return ResponseEntity.ok(profileService.createProfile(userId, email, name));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Profile> updateProfile(
            @PathVariable String userId,
            @RequestBody Profile updatedProfile) {
        log.info("Starting profile update for user: {} with data: {}", userId, updatedProfile);
        Profile existingProfile = profileService.getProfile(userId);
        
        // Save the basic profile update first
        Profile savedProfile = profileService.updateProfile(userId, updatedProfile);
        
        // Check if any platform username has changed and update their stats
        try {
            if (!Objects.equals(existingProfile.getLeetcodeUsername(), updatedProfile.getLeetcodeUsername())) {
                profileService.updateLeetCodeProfile(userId, updatedProfile.getLeetcodeUsername());
            }
            
            if (!Objects.equals(existingProfile.getCodeforcesUsername(), updatedProfile.getCodeforcesUsername())) {
                profileService.updateCodeforcesProfile(userId, updatedProfile.getCodeforcesUsername());
            }
            
            if (!Objects.equals(existingProfile.getCodechefUsername(), updatedProfile.getCodechefUsername())) {
                profileService.updateCodeChefProfile(userId, updatedProfile.getCodechefUsername());
            }
            
            if (!Objects.equals(existingProfile.getAtcoderUsername(), updatedProfile.getAtcoderUsername())) {
                profileService.updateAtCoderProfile(userId, updatedProfile.getAtcoderUsername());
            }
            
            if (!Objects.equals(existingProfile.getGeeksforgeeksUsername(), updatedProfile.getGeeksforgeeksUsername())) {
                profileService.updateGeeksForGeeksProfile(userId, updatedProfile.getGeeksforgeeksUsername());
            }
            
            if (!Objects.equals(existingProfile.getGithubUsername(), updatedProfile.getGithubUsername())) {
                profileService.updateGitHubProfile(userId, updatedProfile.getGithubUsername());
            }
            
            // Fetch the final updated profile with all new stats
            return ResponseEntity.ok(profileService.getProfile(userId));
        } catch (Exception e) {
            log.error("Error updating platform stats: {}", e.getMessage());
            // Return the saved profile even if stats update fails
            return ResponseEntity.ok(savedProfile);
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteProfile(@PathVariable String userId) {
        profileService.deleteProfile(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/leetcode")
    public ResponseEntity<Profile> updateLeetCodeProfile(
            @PathVariable String userId,
            @RequestParam String username) {
        return ResponseEntity.ok(profileService.updateLeetCodeProfile(userId, username));
    }

    @PutMapping("/{userId}/codeforces")
    public ResponseEntity<Profile> updateCodeforcesProfile(
            @PathVariable String userId,
            @RequestParam String handle) {
        return ResponseEntity.ok(profileService.updateCodeforcesProfile(userId, handle));
    }

    @PutMapping("/{userId}/codechef")
    public ResponseEntity<Profile> updateCodeChefProfile(
            @PathVariable String userId,
            @RequestParam String username) {
        try {
            return ResponseEntity.ok(profileService.updateCodeChefProfile(userId, username));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating CodeChef profile: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to update CodeChef profile: " + e.getMessage());
        }
    }

    @PutMapping("/{userId}/geeksforgeeks")
    public ResponseEntity<Profile> updateGeeksForGeeksProfile(
            @PathVariable String userId,
            @RequestParam String username) {
        try {
            return ResponseEntity.ok(profileService.updateGeeksForGeeksProfile(userId, username));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating GeeksForGeeks profile: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to update GeeksForGeeks profile: " + e.getMessage());
        }
    }

    @PutMapping("/{userId}/github")
    public ResponseEntity<Profile> updateGitHubProfile(
            @PathVariable String userId,
            @RequestParam String username) {
        return ResponseEntity.ok(profileService.updateGitHubProfile(userId, username));
    }

    @PutMapping("/{userId}/refresh")
    public ResponseEntity<Profile> refreshProfile(@PathVariable String userId) {
        return ResponseEntity.ok(profileService.updateProfile(userId));
    }

    @GetMapping("/{userId}/leetcode")
    public ResponseEntity<?> getLeetCodeStats(@PathVariable String userId) {
        try {
            Profile profile = profileService.getProfile(userId);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
          
            if (profile.getLeetcodeUsername() == null || profile.getLeetcodeUsername().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "LeetCode username not set"));
            }

            return ResponseEntity.ok(leetCodeClient.getUserProfile(profile.getLeetcodeUsername()));
        } catch (Exception e) {
            log.error("Error fetching LeetCode stats for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch LeetCode stats: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}/codeforces")
    public ResponseEntity<?> getCodeforcesStats(@PathVariable String userId) {
        try {
            log.info("Fetching Codeforces stats for user ID: {}", userId);
            
            Profile profile = profileService.getProfile(userId);
            if (profile == null) {
                log.error("Profile not found for user ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "error", "Profile not found",
                        "message", "User profile does not exist"
                    ));
            }
            
            String username = profile.getCodeforcesUsername();
            if (username == null || username.trim().isEmpty()) {
                log.warn("Codeforces username not set for user ID: {}", userId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "error", "Codeforces username not set",
                        "message", "Please set your Codeforces username first"
                    ));
            }

            log.info("Fetching Codeforces stats for username: {}", username);
            PlatformStatsDTO stats = codeforcesClient.getUserProfile(username);
            
            if (stats == null) {
                log.error("Received null stats from Codeforces API for username: {}", username);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "error", "Failed to fetch Codeforces stats",
                        "message", "Unable to retrieve statistics from Codeforces"
                    ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("totalSolved", stats.getTotalQuestions());
            response.put("totalActiveDays", stats.getTotalActiveDays());
            response.put("totalContests", stats.getTotalContests());
            response.put("rating", stats.getRating());
            response.put("rank", stats.getContestRanking());
            response.put("difficultyWiseSolved", stats.getDifficultyWiseSolved());
            response.put("topicWiseSolved", stats.getTopicWiseSolved());
            response.put("submissionCalendar", stats.getSubmissionCalendar());
            response.put("awards", stats.getAwards());

            log.info("Successfully fetched Codeforces stats for username: {}", username);
            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            log.error("ResponseStatusException while fetching Codeforces stats: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus())
                .body(Map.of(
                    "error", "Failed to fetch Codeforces stats",
                    "message", e.getReason()
            ));
        } catch (Exception e) {
            log.error("Error fetching Codeforces stats: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Failed to fetch Codeforces stats",
                    "message", e.getMessage() != null ? e.getMessage() : "Unknown error occurred"
                ));
        }
    }

    @GetMapping("/{userId}/codechef")
    public ResponseEntity<?> getCodeChefStats(@PathVariable String userId) {
        try {
            Profile profile = profileService.getProfile(userId);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            
            String username = profile.getCodechefUsername();
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "error", "CodeChef username not set",
                        "message", "Please set your CodeChef username first"
                    ));
            }

            PlatformStatsDTO stats = codeChefClient.getUserProfile(username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("totalQuestions", stats.getTotalQuestions());
            response.put("totalActiveDays", stats.getTotalActiveDays());
            response.put("totalContests", stats.getTotalContests());
            response.put("rating", stats.getRating());
            response.put("contestRanking", stats.getContestRanking());
            response.put("difficultyWiseSolved", stats.getDifficultyWiseSolved());
            response.put("topicWiseSolved", stats.getTopicWiseSolved());
            response.put("submissionCalendar", stats.getSubmissionCalendar());
            response.put("awards", stats.getAwards());

            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatus())
                .body(Map.of(
                    "error", "Failed to fetch CodeChef stats",
                    "message", e.getReason()
            ));
        } catch (Exception e) {
            log.error("Error fetching CodeChef stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Failed to fetch CodeChef stats",
                    "message", e.getMessage() != null ? e.getMessage() : "Unknown error occurred"
                ));
        }
    }

    @GetMapping("/{userId}/geeksforgeeks")
    public ResponseEntity<?> getGeeksForGeeksStats(@PathVariable String userId) {
        try {
            log.info("Fetching GeeksForGeeks stats for user ID: {}", userId);
            
            Profile profile = profileService.getProfile(userId);
            if (profile == null) {
                log.error("Profile not found for user ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "error", "Profile not found",
                        "message", "User profile does not exist"
                    ));
            }
            
            String username = profile.getGeeksforgeeksUsername();
            if (username == null || username.trim().isEmpty()) {
                log.warn("GeeksForGeeks username not set for user ID: {}", userId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "error", "GeeksForGeeks username not set",
                        "message", "Please set your GeeksForGeeks username first"
                    ));
            }

            log.info("Fetching GeeksForGeeks stats for username: {}", username);
            Map<String, Object> stats = profileService.getGeeksForGeeksStats(userId);
            
            if (stats == null) {
                log.error("Received null stats from GeeksForGeeks API for username: {}", username);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "error", "Failed to fetch GeeksForGeeks stats",
                        "message", "Unable to retrieve statistics from GeeksForGeeks"
                    ));
            }

            Map<String, Object> response = new HashMap<>(stats);
            response.put("username", username);
            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            log.error("ResponseStatusException while fetching GeeksForGeeks stats: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus())
                .body(Map.of(
                    "error", "Failed to fetch GeeksForGeeks stats",
                    "message", e.getReason()
                ));
        } catch (Exception e) {
            log.error("Error fetching GeeksForGeeks stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Failed to fetch GeeksForGeeks stats",
                    "message", e.getMessage() != null ? e.getMessage() : "Unknown error occurred"
                ));
        }
    }

    @PutMapping("/platforms/geeksforgeeks/username")
    public ResponseEntity<?> updateGeeksForGeeksUsername(@RequestParam String userId, @RequestParam String username) {
        try {
            log.info("Updating GeeksForGeeks username for user: {} to {}", userId, username);
            Profile updatedProfile = profileService.updateGeeksForGeeksProfile(userId, username);
            return ResponseEntity.ok(Map.of(
                "message", "GeeksForGeeks username updated successfully",
                "username", username
            ));
        } catch (ResponseStatusException e) {
            log.error("Error updating GeeksForGeeks username: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus())
                    .body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            log.error("Error updating GeeksForGeeks username: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating GeeksForGeeks username"));
        }
    }

    @GetMapping("/{userId}/github/stats")
    public ResponseEntity<?> getGitHubStats(@PathVariable String userId) {
        try {
            String decodedUserId = URLDecoder.decode(userId, StandardCharsets.UTF_8.toString());
            log.info("Fetching GitHub stats for user ID: {}", decodedUserId);
            
            Profile profile = profileService.getProfile(decodedUserId);
            if (profile == null) {
                log.error("Profile not found for user ID: {}", decodedUserId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Profile not found", 
                                "message", "No profile exists for this user ID"));
            }
            log.info("Found profile for user ID: {}", decodedUserId);
            
            String githubUsername = profile.getGithubUsername();
            if (githubUsername == null || githubUsername.trim().isEmpty()) {
                log.warn("GitHub username not set for user ID: {}", decodedUserId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "GitHub username not set",
                                "message", "Please set your GitHub username in profile settings first"));
            }
            log.info("Found GitHub username: {} for user ID: {}", githubUsername, decodedUserId);

            try {
            Map<String, Object> githubStats = profileService.getGitHubStats(decodedUserId);
            return ResponseEntity.ok(githubStats);
            } catch (Exception e) {
                log.error("Error fetching GitHub stats for username {}: {}", githubUsername, e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching GitHub stats",
                                "message", e.getMessage(),
                                "details", e.getClass().getSimpleName()));
            }
        } catch (Exception e) {
            log.error("Unexpected error in getGitHubStats: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Unexpected error",
                            "message", e.getMessage(),
                            "details", e.getClass().getSimpleName()));
        }
    }

    @PutMapping("/platforms/github/username")
    public ResponseEntity<?> updateGitHubUsername(@RequestParam String userId, @RequestParam String username) {
        try {
            log.info("Updating GitHub username for user: {} to {}", userId, username);
            Profile profile = profileService.getProfile(userId);
            profile.setGithubUsername(username);
            
            Map<String, Object> stats = profileService.getGitHubStats(userId);
            
            profile.setGithubRepos((Integer) stats.getOrDefault("repositories", 0));
            profile.setGithubStars((Integer) stats.getOrDefault("stars", 0));
            profile.setGithubFollowers((Integer) stats.getOrDefault("followers", 0));
            profile.setGithubFollowing((Integer) stats.getOrDefault("following", 0));
            
            profileService.updateProfile(userId, profile);
            
            return ResponseEntity.ok(Map.of(
                "message", "GitHub username updated successfully",
                "username", username
            ));
        } catch (Exception e) {
            log.error("Error updating GitHub username: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error updating GitHub username: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getOrCreateProfile(
            @RequestParam String userId,
            @RequestParam String email,
            @RequestParam String name) {
        try {
            Profile profile;
            try {
                profile = profileService.getProfile(userId);
                log.info("Found existing profile for user: {}", userId);
            } catch (Exception e) {
                log.info("Creating new profile for user: {}", userId);
                profile = profileService.createProfile(userId, email, name);
            }
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("Error in getOrCreateProfile: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error processing profile request"));
        }
    }

    @GetMapping("/{userId}/atcoder")
    public ResponseEntity<?> getAtCoderStats(@PathVariable String userId) {
        try {
            Profile profile = profileService.getProfile(userId);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            
            String username = profile.getAtcoderUsername();
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "error", "AtCoder username not set",
                        "message", "Please set your AtCoder username first"
                    ));
            }

            Map<String, Object> stats = profileService.getAtCoderStats(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("rating", stats.getOrDefault("rating", 0));
            response.put("totalQuestions", stats.getOrDefault("totalQuestions", 0));
            response.put("totalContests", stats.getOrDefault("totalContests", 0));
            response.put("contestRanking", stats.getOrDefault("contestRanking", 0));

            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatus())
                .body(Map.of(
                    "error", "Failed to fetch AtCoder stats",
                    "message", e.getReason()
            ));
        } catch (Exception e) {
            log.error("Error fetching AtCoder stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Failed to fetch AtCoder stats",
                    "message", e.getMessage() != null ? e.getMessage() : "Unknown error occurred"
                ));
        }
    }

    @PutMapping("/{userId}/atcoder")
    public ResponseEntity<Profile> updateAtCoderProfile(
            @PathVariable String userId,
            @RequestParam String username) {
        try {
            return ResponseEntity.ok(profileService.updateAtCoderProfile(userId, username));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating AtCoder profile: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to update AtCoder profile: " + e.getMessage());
        }
    }

    @GetMapping("/github/{username}")
    public ResponseEntity<?> getGitHubProfile(@PathVariable String username) {
        try {
            log.info("Fetching GitHub profile for username: {}", username);
            GitHubStatsDTO profile = gitHubClient.getUserProfile(username);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("Error fetching GitHub profile for username: {}", username, e);
            
            // Create error response
            Map<String, String> errorResponse = new HashMap<>();
            String errorMessage = e.getMessage();
            
            if (errorMessage != null && errorMessage.contains("rate limit exceeded")) {
                errorResponse.put("error", "GitHub API rate limit exceeded. Please try again later or set up a GitHub token.");
                errorResponse.put("message", "This happens when too many requests are made to GitHub's API. The limit refreshes hourly.");
                errorResponse.put("status", "RATE_LIMITED");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorResponse);
            } else {
                errorResponse.put("error", "Failed to fetch GitHub profile");
                errorResponse.put("message", errorMessage);
                errorResponse.put("status", "ERROR");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        }
    }
} 