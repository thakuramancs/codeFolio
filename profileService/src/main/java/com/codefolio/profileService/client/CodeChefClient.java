package com.codefolio.profileService.client;

import com.codefolio.profileService.dto.PlatformStatsDTO;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class CodeChefClient {
    private static final String API_URL = "https://codechef-api.vercel.app/handle/%s";
    private static final Logger log = LoggerFactory.getLogger(CodeChefClient.class);
    private final RestTemplate restTemplate;

    public CodeChefClient() {
        this.restTemplate = new RestTemplate();
    }

    public PlatformStatsDTO getUserProfile(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CodeChef username cannot be empty");
        }

        try {
            String encodedUsername = URLEncoder.encode(username.trim(), StandardCharsets.UTF_8.toString());
            String apiUrl = String.format(API_URL, encodedUsername);
            
            ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CodeChef profile not found");
            }

            JSONObject json = new JSONObject(response.getBody());
            if (!json.getBoolean("success")) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CodeChef profile not found");
            }

            PlatformStatsDTO stats = new PlatformStatsDTO();
            
            // Set basic stats
            stats.setRating(json.optInt("currentRating", 0));
            
            // Process contest data
            JSONArray ratingData = json.optJSONArray("ratingData");
            if (ratingData != null) {
                stats.setTotalContests(ratingData.length());
                if (ratingData.length() > 0) {
                    JSONObject latestContest = ratingData.getJSONObject(0);
                    String rankStr = latestContest.optString("rank", "0");
                    stats.setContestRanking(Integer.parseInt(rankStr.replaceAll("[^0-9]", "")));
                }
            }
            
            // Process submission data
            if (json.has("heatMap")) {
                JSONArray heatMap = json.getJSONArray("heatMap");
                JSONObject calendar = new JSONObject();
                int activeDays = 0;
                int totalSubmissions = 0;
                
                for (int i = 0; i < heatMap.length(); i++) {
                    JSONObject day = heatMap.getJSONObject(i);
                    String date = day.getString("date");
                    int value = day.getInt("value");
                    
                    if (value > 0) {
                        calendar.put(date, value);
                        activeDays++;
                        totalSubmissions += value;
                    }
                }
                
                stats.setSubmissionCalendar(calendar.toString());
                stats.setTotalActiveDays(activeDays);
                stats.setTotalQuestions(totalSubmissions);
            }
            
            // Initialize empty maps for difficulty and topic data
            stats.setDifficultyWiseSolved(new HashMap<>());
            stats.setTopicWiseSolved(new HashMap<>());
            
            return stats;

        } catch (ResponseStatusException e) {
            throw e;
        } catch (NumberFormatException e) {
            log.error("Error parsing number in CodeChef profile for {}: {}", username, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to parse CodeChef profile data");
        } catch (Exception e) {
            log.error("Error fetching CodeChef profile for {}: {}", username, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to fetch CodeChef profile: " + e.getMessage());
        }
    }
} 