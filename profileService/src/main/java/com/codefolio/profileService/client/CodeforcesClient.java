package com.codefolio.profileService.client;

import com.codefolio.profileService.dto.PlatformStatsDTO;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import java.util.HashMap;
import java.util.Map;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class CodeforcesClient {
    private static final String CF_API_USER_INFO = "https://codeforces.com/api/user.info?handles=%s";
    private static final String CF_API_USER_STATUS = "https://codeforces.com/api/user.status?handle=%s";
    private static final String CF_API_USER_RATING = "https://codeforces.com/api/user.rating?handle=%s";
    private static final Logger log = LoggerFactory.getLogger(CodeforcesClient.class);
    private final RestTemplate restTemplate;
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000;

    public CodeforcesClient() {
        this.restTemplate = new RestTemplate();
    }

    private <T> T executeWithRetry(String url, Class<T> responseType) {
        int attempts = 0;
        Exception lastException = null;

        while (attempts < MAX_RETRIES) {
            try {
                ResponseEntity<T> response = restTemplate.getForEntity(url, responseType);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return response.getBody();
                }
            } catch (ResourceAccessException e) {
                log.warn("Attempt {} failed due to connection issue: {}", attempts + 1, e.getMessage());
                lastException = e;
            } catch (RestClientException e) {
                log.warn("Attempt {} failed: {}", attempts + 1, e.getMessage());
                lastException = e;
            }

            attempts++;
            if (attempts < MAX_RETRIES) {
                try {
                    Thread.sleep(RETRY_DELAY_MS * attempts);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, 
            "Failed to connect to Codeforces API after " + MAX_RETRIES + " attempts: " + 
            (lastException != null ? lastException.getMessage() : "Unknown error"));
    }

    public PlatformStatsDTO getUserProfile(String handle) {
        if (handle == null || handle.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codeforces handle cannot be empty");
        }

        try {
            String encodedHandle = URLEncoder.encode(handle.trim(), StandardCharsets.UTF_8.toString());
            
            // Get user info with retry
            String userInfoResponse = executeWithRetry(
                String.format(CF_API_USER_INFO, encodedHandle), 
                String.class
            );
            JSONObject userInfo = new JSONObject(userInfoResponse);

            if (!"OK".equals(userInfo.getString("status"))) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Codeforces profile not found");
            }

            // Get submissions with retry
            String userStatusResponse = executeWithRetry(
                String.format(CF_API_USER_STATUS, encodedHandle), 
                String.class
            );
            JSONObject userStatus = new JSONObject(userStatusResponse);

            // Get rating history with retry
            String userRatingResponse = executeWithRetry(
                String.format(CF_API_USER_RATING, encodedHandle), 
                String.class
            );
            JSONObject userRating = new JSONObject(userRatingResponse);

            // Process the data
            PlatformStatsDTO stats = new PlatformStatsDTO();
            JSONObject user = userInfo.getJSONArray("result").getJSONObject(0);
            
            // Set basic info
            stats.setRating(user.optInt("maxRating", 0));
            stats.setContestRanking(user.optInt("rating", 0));
            
            // Process submissions
            if ("OK".equals(userStatus.getString("status"))) {
                JSONArray submissions = userStatus.getJSONArray("result");
                Map<String, Integer> difficultyMap = new HashMap<>();
                Map<String, Integer> topicMap = new HashMap<>();
                Map<String, Integer> submissionDates = new HashMap<>();
                
                int totalSolved = 0;
                for (int i = 0; i < submissions.length(); i++) {
                    JSONObject submission = submissions.getJSONObject(i);
                    if ("OK".equals(submission.getString("verdict"))) {
                        totalSolved++;
                        
                        // Track difficulty and topics
                        JSONObject problem = submission.getJSONObject("problem");
                        String difficulty = String.valueOf(problem.optInt("rating", 0));
                        difficultyMap.merge(difficulty, 1, Integer::sum);
                        
                        JSONArray tags = problem.getJSONArray("tags");
                        for (int j = 0; j < tags.length(); j++) {
                            topicMap.merge(tags.getString(j), 1, Integer::sum);
                        }
                        
                        // Track submission date
                        String date = new java.text.SimpleDateFormat("yyyy-MM-dd")
                            .format(new java.util.Date(submission.getLong("creationTimeSeconds") * 1000));
                        submissionDates.merge(date, 1, Integer::sum);
                    }
                }
                
                stats.setTotalQuestions(totalSolved);
                stats.setDifficultyWiseSolved(difficultyMap);
                stats.setTopicWiseSolved(topicMap);
                stats.setSubmissionCalendar(new JSONObject(submissionDates).toString());
                stats.setTotalActiveDays(submissionDates.size());
            }

            // Process contest participation
            if ("OK".equals(userRating.getString("status"))) {
                JSONArray contests = userRating.getJSONArray("result");
                stats.setTotalContests(contests.length());
            }

            // Create awards array
            JSONArray awards = new JSONArray();
            if (user.has("rating")) {
                JSONObject ratingAward = new JSONObject();
                ratingAward.put("name", "Current Rating");
                ratingAward.put("value", user.getInt("rating"));
                awards.put(ratingAward);
            }
            if (user.has("maxRating")) {
                JSONObject maxRatingAward = new JSONObject();
                maxRatingAward.put("name", "Max Rating");
                maxRatingAward.put("value", user.getInt("maxRating"));
                awards.put(maxRatingAward);
            }
            stats.setAwards(awards.toString());
            
            return stats;

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching Codeforces profile for {}: {}", handle, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to process Codeforces profile data: " + e.getMessage());
        }
    }
} 