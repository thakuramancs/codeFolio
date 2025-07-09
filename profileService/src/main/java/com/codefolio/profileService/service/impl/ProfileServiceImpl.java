package com.codefolio.profileService.service.impl;

import com.codefolio.profileService.model.Profile;
import com.codefolio.profileService.model.PlatformStats;
import com.codefolio.profileService.repository.ProfileRepository;
import com.codefolio.profileService.service.ProfileService;
import com.codefolio.profileService.client.LeetCodeClient;
import com.codefolio.profileService.client.CodeforcesClient;
import com.codefolio.profileService.client.CodeChefClient;
import com.codefolio.profileService.client.AtCoderClient;
import com.codefolio.profileService.client.GeeksForGeeksClient;
import com.codefolio.profileService.client.GitHubClient;
import com.codefolio.profileService.dto.PlatformStatsDTO;
import com.codefolio.profileService.dto.GitHubStatsDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;

@Service("profileService")
public class ProfileServiceImpl implements ProfileService {
    
    private static final Logger log = LoggerFactory.getLogger(ProfileServiceImpl.class);
    private final ProfileRepository profileRepository;
    private final LeetCodeClient leetCodeClient;
    private final CodeforcesClient codeforcesClient;
    private final CodeChefClient codeChefClient;
    private final AtCoderClient atcoderClient;
    private final GeeksForGeeksClient geeksForGeeksClient;
    private final GitHubClient gitHubClient;

    public ProfileServiceImpl(ProfileRepository profileRepository, LeetCodeClient leetCodeClient, CodeforcesClient codeforcesClient, CodeChefClient codeChefClient, AtCoderClient atcoderClient, GeeksForGeeksClient geeksForGeeksClient, GitHubClient gitHubClient) {
        this.profileRepository = profileRepository;
        this.leetCodeClient = leetCodeClient;
        this.codeforcesClient = codeforcesClient;
        this.codeChefClient = codeChefClient;
        this.atcoderClient = atcoderClient;
        this.geeksForGeeksClient = geeksForGeeksClient;
        this.gitHubClient = gitHubClient;
    }

    @Override
    public Profile createProfile(String userId, String email, String name) {
        log.info("Creating profile for user: {}", userId);
        if (profileRepository.findByUserId(userId).isPresent()) {
            log.error("Profile already exists for user: {}", userId);
            throw new IllegalStateException("Profile already exists");
        }
        Profile profile = new Profile(userId, email, name);
        return profileRepository.save(profile);
    }

    @Override
    public Profile getProfile(String userId) {
        log.info("Fetching profile for user: {}", userId);
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    log.error("Profile not found for user: {}", userId);
                    return new IllegalStateException("Profile not found");
                });
    }

    @Override
    @Transactional
    public Profile updateProfile(String userId) {
        log.info("Updating profile stats for user: {}", userId);
        Profile profile = getProfile(userId);
        
        // Update stats for all platforms if usernames exist
        if (profile.getLeetcodeUsername() != null) {
            try {
                PlatformStatsDTO leetcodeStats = leetCodeClient.getUserProfile(profile.getLeetcodeUsername());
                updatePlatformStats(profile.getLeetcodeStats(), leetcodeStats);
            } catch (Exception e) {
                log.error("Failed to update LeetCode stats", e);
            }
        }
        
        if (profile.getCodeforcesUsername() != null) {
            try {
                PlatformStatsDTO codeforcesStats = codeforcesClient.getUserProfile(profile.getCodeforcesUsername());
                updatePlatformStats(profile.getCodeforcesStats(), codeforcesStats);
            } catch (Exception e) {
                log.error("Failed to update CodeForces stats", e);
            }
        }
        
        if (profile.getCodechefUsername() != null) {
            try {
                PlatformStatsDTO codechefStats = codeChefClient.getUserProfile(profile.getCodechefUsername());
                updatePlatformStats(profile.getCodechefStats(), codechefStats);
            } catch (Exception e) {
                log.error("Failed to update CodeChef stats", e);
            }
        }
        
        profile.setLastUpdated(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    @Override
    @Transactional
    public Profile updateProfile(String userId, Profile updatedProfile) {
        log.info("Starting profile update for user: {} with data: {}", userId, updatedProfile);
        Profile existingProfile = getProfile(userId);
        
        boolean needsStatsUpdate = false;
        
        // Update basic info
        existingProfile.setName(updatedProfile.getName());
        existingProfile.setEmail(updatedProfile.getEmail());
        
        // Update platform usernames and check if stats need updating
        if (!Objects.equals(existingProfile.getCodechefUsername(), updatedProfile.getCodechefUsername())) {
            existingProfile.setCodechefUsername(updatedProfile.getCodechefUsername());
            clearPlatformStats(existingProfile.getCodechefStats());
            needsStatsUpdate = true;
        }
        
        if (!Objects.equals(existingProfile.getLeetcodeUsername(), updatedProfile.getLeetcodeUsername())) {
            existingProfile.setLeetcodeUsername(updatedProfile.getLeetcodeUsername());
            clearPlatformStats(existingProfile.getLeetcodeStats());
            needsStatsUpdate = true;
        }
        
        if (!Objects.equals(existingProfile.getCodeforcesUsername(), updatedProfile.getCodeforcesUsername())) {
            existingProfile.setCodeforcesUsername(updatedProfile.getCodeforcesUsername());
            clearPlatformStats(existingProfile.getCodeforcesStats());
            needsStatsUpdate = true;
        }
        
        // Update other platform usernames
        existingProfile.setAtcoderUsername(updatedProfile.getAtcoderUsername());
        existingProfile.setGeeksforgeeksUsername(updatedProfile.getGeeksforgeeksUsername());
        existingProfile.setGithubUsername(updatedProfile.getGithubUsername());
        
        existingProfile.setLastUpdated(LocalDateTime.now());
        
        // First save to ensure usernames are updated
        Profile savedProfile = profileRepository.save(existingProfile);
        
        // If any platform username changed, update stats
        if (needsStatsUpdate) {
            try {
                return updateProfile(userId);
            } catch (Exception e) {
                log.error("Error updating platform stats: {}", e.getMessage());
                return savedProfile;
            }
        }
        
        return savedProfile;
    }

    private void clearPlatformStats(PlatformStats stats) {
        if (stats != null) {
            stats.setTotalQuestions(0);
            stats.setTotalActiveDays(0);
            stats.setTotalContests(0);
            stats.setRating(0);
            stats.setContestRanking(0);
            stats.setDifficultyWiseSolved(new HashMap<>());
            stats.setTopicWiseSolved(new HashMap<>());
            stats.setSubmissionCalendar("");
            stats.setAwards("");
        }
    }

    @Override
    public void deleteProfile(String userId) {
        log.info("Deleting profile for user: {}", userId);
        profileRepository.delete(getProfile(userId));
    }

    @Override
    public Profile updateLeetCodeProfile(String userId, String username) {
        log.info("Updating LeetCode profile for user: {}", userId);
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("LeetCode username cannot be empty");
        }

        Profile profile = getProfile(userId);
        profile.setLeetcodeUsername(username);
        
        try {
            PlatformStatsDTO stats = leetCodeClient.getUserProfile(username);
            updatePlatformStats(profile.getLeetcodeStats(), stats);
            profile.setLastUpdated(LocalDateTime.now());
            return profileRepository.save(profile);
        } catch (Exception e) {
            log.error("Failed to update LeetCode profile for user: {}", userId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to update LeetCode profile: " + e.getMessage());
        }
    }

    @Override
    public Profile updateCodeforcesProfile(String userId, String handle) {
        log.info("Updating CodeForces profile for user: {}", userId);
        if (handle == null || handle.trim().isEmpty()) {
            throw new IllegalArgumentException("CodeForces handle cannot be empty");
        }

        Profile profile = getProfile(userId);
        profile.setCodeforcesUsername(handle);
        
        try {
            PlatformStatsDTO stats = codeforcesClient.getUserProfile(handle);
            updatePlatformStats(profile.getCodeforcesStats(), stats);
            profile.setLastUpdated(LocalDateTime.now());
            return profileRepository.save(profile);
        } catch (Exception e) {
            log.error("Failed to update CodeForces profile for user: {}", userId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to update CodeForces profile: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getAtCoderStats(String userId) {
        try {
            Profile profile = getProfile(userId);
            if (profile.getAtcoderUsername() == null || profile.getAtcoderUsername().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "AtCoder username not set");
            }
            PlatformStatsDTO stats = atcoderClient.getUserProfile(profile.getAtcoderUsername());
            return Map.of(
                "rating", stats.getRating(),
                "totalQuestions", stats.getTotalQuestions(),
                "totalContests", stats.getTotalContests(),
                "contestRanking", stats.getContestRanking()
            );
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error getting AtCoder stats for user {}: {}", userId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to retrieve AtCoder stats. Please try again later.");
        }
    }

    @Override
    public Profile updateAtCoderProfile(String userId, String username) {
        try {
            Profile profile = getProfile(userId);
            atcoderClient.getUserProfile(username); // Validate username exists
            profile.setAtcoderUsername(username);
            return profileRepository.save(profile);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating AtCoder username for user {}: {}", userId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to update AtCoder username. Please try again later.");
        }
    }

    @Override
    public Map<String, Object> getGeeksForGeeksStats(String userId) {
        try {
            Profile profile = getProfile(userId);
            if (profile.getGeeksforgeeksUsername() == null || profile.getGeeksforgeeksUsername().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "GeeksForGeeks username not set");
            }
            
            PlatformStatsDTO stats = geeksForGeeksClient.getUserProfile(profile.getGeeksforgeeksUsername());
            
            return Map.of(
                "totalQuestions", stats.getTotalQuestions(),
                "rating", stats.getRating(),
                "contestRanking", stats.getContestRanking(),
                "totalActiveDays", stats.getTotalActiveDays(),
                "difficultyWiseSolved", stats.getDifficultyWiseSolved(),
                "topicWiseSolved", stats.getTopicWiseSolved(),
                "submissionCalendar", stats.getSubmissionCalendar(),
                "awards", stats.getAwards()
            );
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error getting GeeksForGeeks stats for user {}: {}", userId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to retrieve GeeksForGeeks stats. Please try again later.");
        }
    }

    @Override
    public Profile updateGeeksForGeeksProfile(String userId, String username) {
        log.info("Updating GeeksForGeeks profile for user: {}", userId);
        
        if (username == null || username.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "GeeksForGeeks username cannot be empty");
        }

        Profile profile = getProfile(userId);
        if (profile == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }

        profile.setGeeksforgeeksUsername(username);
        
        try {
            PlatformStatsDTO stats = geeksForGeeksClient.getUserProfile(username);
            updatePlatformStats(profile.getGeeksforgeeksStats(), stats);
            profile.setLastUpdated(LocalDateTime.now());
            return profileRepository.save(profile);
        } catch (Exception e) {
            log.error("Error updating GeeksForGeeks profile for user: {}", userId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update GeeksForGeeks profile");
        }
    }

    @Override
    public Map<String, Object> getGitHubStats(String userId) {
        log.info("Fetching GitHub stats for user: {}", userId);
        
        try {
            Profile profile = getProfile(userId);
            if (profile == null) {
                log.error("Profile not found for user ID: {}", userId);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
            }
            
            String githubUsername = profile.getGithubUsername();
            if (githubUsername == null || githubUsername.trim().isEmpty()) {
                log.error("GitHub username not set for user ID: {}", userId);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "GitHub username not set. Please set your GitHub username first.");
        }

        try {
                log.info("Fetching GitHub stats for username: {}", githubUsername);
                GitHubStatsDTO stats = gitHubClient.getUserProfile(githubUsername);
                
                if (stats == null) {
                    log.error("Received null stats from GitHub client for username: {}", githubUsername);
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                        "Failed to fetch GitHub stats: Received null response");
                }
                
                Map<String, Object> response = new HashMap<>();
                
                // Basic stats
                response.put("repositories", stats.getPublicRepos());
                response.put("stars", stats.getTotalStars());
                response.put("followers", stats.getFollowers());
                response.put("following", stats.getFollowing());
                
                // Contribution stats
                response.put("totalContributions", stats.getTotalContributions());
                response.put("totalActiveDays", stats.getTotalActiveDays());
                response.put("currentStreak", stats.getCurrentStreak());
                response.put("maxStreak", stats.getMaxStreak());
                
                // Activity stats
                response.put("prs", stats.getPrs());
                response.put("issues", stats.getIssues());
                response.put("commits", stats.getCommits());
                
                // Languages and contribution calendar
                response.put("languages", stats.getLanguages());
                response.put("contributionCalendar", stats.getContributionCalendar());
                
                log.info("Successfully fetched GitHub stats for username: {}", githubUsername);
                return response;
            } catch (Exception e) {
                log.error("Error fetching GitHub stats from client for username {}: {}", 
                    githubUsername, e.getMessage(), e);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to fetch GitHub stats: " + e.getMessage());
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in getGitHubStats for user {}: {}", 
                userId, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Unexpected error while fetching GitHub stats: " + e.getMessage());
        }
    }

    @Override
    public Profile updateGitHubProfile(String userId, String username) {
        log.info("Updating GitHub profile for user: {}", userId);
        
        if (username == null || username.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "GitHub username cannot be empty");
        }

        Profile profile = getProfile(userId);
        if (profile == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }

        profile.setGithubUsername(username);
        
        try {
            GitHubStatsDTO stats = gitHubClient.getUserProfile(username);
            // Update GitHub stats directly on profile
            profile.setGithubRepos(stats.getPublicRepos());
            profile.setGithubStars(stats.getTotalStars());
            profile.setGithubFollowers(stats.getFollowers());
            profile.setGithubFollowing(stats.getFollowing());
            profile.setLastUpdated(LocalDateTime.now());
            return profileRepository.save(profile);
        } catch (Exception e) {
            log.error("Error updating GitHub profile for user: {}", userId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update GitHub profile");
        }
    }

    @Override
    @Transactional
    public Profile updateCodeChefProfile(String userId, String username) {
        log.info("Updating CodeChef profile for user: {} with new username: {}", userId, username);
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("CodeChef username cannot be empty");
        }

        Profile profile = getProfile(userId);
        
        // Clear old stats
        clearPlatformStats(profile.getCodechefStats());
        
        // Set new username and save
        profile.setCodechefUsername(username);
        profile = profileRepository.save(profile);
        
        try {
            // Fetch and update stats for new username
            PlatformStatsDTO stats = codeChefClient.getUserProfile(username);
            updatePlatformStats(profile.getCodechefStats(), stats);
            profile.setLastUpdated(LocalDateTime.now());
            return profileRepository.save(profile);
        } catch (Exception e) {
            log.error("Failed to update CodeChef profile for user: {} with error: {}", userId, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to update CodeChef profile: " + e.getMessage());
        }
    }

    private void updatePlatformStats(PlatformStats target, PlatformStatsDTO source) {
        if (source == null) return;
        
        target.setTotalQuestions(source.getTotalQuestions());
        target.setTotalActiveDays(source.getTotalActiveDays());
        target.setTotalContests(source.getTotalContests());
        target.setRating(source.getRating());
        target.setContestRanking(source.getContestRanking());
        target.setDifficultyWiseSolved(source.getDifficultyWiseSolved());
        target.setTopicWiseSolved(source.getTopicWiseSolved());
        target.setSubmissionCalendar(source.getSubmissionCalendar());
        target.setAwards(source.getAwards());
    }
} 