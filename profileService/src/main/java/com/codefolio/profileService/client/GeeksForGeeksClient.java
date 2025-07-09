package com.codefolio.profileService.client;

import com.codefolio.profileService.dto.PlatformStatsDTO;
import org.json.JSONObject;
import org.json.JSONArray;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.*;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Component
public class GeeksForGeeksClient {
    private static final String GFG_API_URL = "https://geeks-for-geeks-api.vercel.app/%s";
    private static final Logger log = LoggerFactory.getLogger(GeeksForGeeksClient.class);
    private final RestTemplate restTemplate;

    public GeeksForGeeksClient() {
        this.restTemplate = new RestTemplate();
    }

    public PlatformStatsDTO getUserProfile(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "GeeksForGeeks username cannot be empty");
        }

        try {
            String apiUrl = String.format(GFG_API_URL, username);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "Mozilla/5.0");
            
            HttpEntity<String> request = new HttpEntity<>(headers);
            
            try {
                ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.GET, request, String.class);

                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    log.error("GeeksForGeeks API returned unsuccessful response: {}", response.getStatusCode());
                    throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, 
                        "GeeksForGeeks service is currently unavailable. Please try again later.");
                }

                JSONObject jsonResponse = new JSONObject(response.getBody());
                if (jsonResponse.has("error")) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "GeeksForGeeks profile not found for username: " + username);
                }

                JSONObject info = jsonResponse.getJSONObject("info");
                JSONObject solvedStats = jsonResponse.getJSONObject("solvedStats");

                PlatformStatsDTO stats = new PlatformStatsDTO();

                // Set total questions solved
                stats.setTotalQuestions(info.getInt("totalProblemsSolved"));

                // Set coding score as rating
                stats.setRating(info.getInt("codingScore"));

                // Set institute rank in contestRanking field
                stats.setContestRanking(info.getInt("instituteRank"));

                // Set max streak as total active days
                stats.setTotalActiveDays(info.getInt("maxStreak"));

                // Parse difficulty-wise solved problems
                Map<String, Integer> difficultyWise = new HashMap<>();
                JSONObject easy = solvedStats.getJSONObject("easy");
                JSONObject medium = solvedStats.getJSONObject("medium");
                JSONObject hard = solvedStats.getJSONObject("hard");
                JSONObject basic = solvedStats.getJSONObject("basic");
                
                difficultyWise.put("easy", easy.getInt("count"));
                difficultyWise.put("medium", medium.getInt("count"));
                difficultyWise.put("hard", hard.getInt("count"));
                difficultyWise.put("basic", basic.getInt("count"));
                
            stats.setDifficultyWiseSolved(difficultyWise);

                // Create topic-wise solved map (using problem categories)
            Map<String, Integer> topicWise = new HashMap<>();
                // Add counts from each difficulty level
                addQuestionsToTopicMap(topicWise, easy.getJSONArray("questions"), "easy");
                addQuestionsToTopicMap(topicWise, medium.getJSONArray("questions"), "medium");
                addQuestionsToTopicMap(topicWise, hard.getJSONArray("questions"), "hard");
                addQuestionsToTopicMap(topicWise, basic.getJSONArray("questions"), "basic");
                
            stats.setTopicWiseSolved(topicWise);

                // Set submission calendar (empty as it's not provided by the API)
                stats.setSubmissionCalendar("{}");

                // Create awards JSON array with only coding score
                JSONArray awards = new JSONArray();
                if (info.getInt("codingScore") > 0) {
                    JSONObject codingScoreAward = new JSONObject();
                    codingScoreAward.put("name", "Coding Score");
                    codingScoreAward.put("value", info.getInt("codingScore"));
                    awards.put(codingScoreAward);
                }
                stats.setAwards(awards.toString());

                return stats;

            } catch (ResourceAccessException e) {
                log.error("Failed to connect to GeeksForGeeks API: {}", e.getMessage());
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, 
                    "Unable to connect to GeeksForGeeks. Please check your internet connection and try again later.");
            }

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching GeeksForGeeks profile for {}: {}", username, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to process GeeksForGeeks profile data. Please try again later.");
        }
    }

    private void addQuestionsToTopicMap(Map<String, Integer> topicMap, JSONArray questions, String difficulty) {
        for (int i = 0; i < questions.length(); i++) {
            JSONObject question = questions.getJSONObject(i);
            String questionName = question.getString("question");
            // Use the question name as a topic and count occurrences
            topicMap.merge(questionName, 1, Integer::sum);
        }
    }
} 