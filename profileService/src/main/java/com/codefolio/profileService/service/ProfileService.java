package com.codefolio.profileService.service;

import com.codefolio.profileService.model.Profile;
import java.util.Map;

public interface ProfileService {
    Profile createProfile(String userId, String email, String name);
    Profile getProfile(String userId);
    Profile updateProfile(String userId);
    Profile updateProfile(String userId, Profile profile);
    void deleteProfile(String userId);
    
    // LeetCode
    Profile updateLeetCodeProfile(String userId, String username);
    
    // CodeForces
    Profile updateCodeforcesProfile(String userId, String handle);
    
    // CodeChef
    Profile updateCodeChefProfile(String userId, String username);
    
    // AtCoder
    Map<String, Object> getAtCoderStats(String userId);
    Profile updateAtCoderProfile(String userId, String username);
    
    // GeeksForGeeks
    Map<String, Object> getGeeksForGeeksStats(String userId);
    Profile updateGeeksForGeeksProfile(String userId, String username);
    
    // GitHub
    Map<String, Object> getGitHubStats(String userId);
    Profile updateGitHubProfile(String userId, String username);
} 