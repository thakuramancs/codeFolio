package com.codefolio.contestService.Clients;

import com.codefolio.contestService.model.CodeChefContest;
import com.codefolio.contestService.model.CodeChefResponse;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class CodeChefClient {
    private static final Logger logger = LoggerFactory.getLogger(CodeChefClient.class);
    private static final String CODECHEF_API_URL = "https://www.codechef.com/api/list/contests/all";

    public CodeChefResponse getActiveContests() {
        logger.info("Fetching contests from CodeChef");
        CodeChefResponse response = new CodeChefResponse();
        List<CodeChefContest> contests = new ArrayList<>();

        try {
            URL url = new URL(CODECHEF_API_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");
            conn.setRequestProperty("Accept", "application/json");

            if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder content = new StringBuilder();
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    content.append(inputLine);
                }
                in.close();

                JSONObject jsonResponse = new JSONObject(content.toString());
                
                // Process present contests
                if (jsonResponse.has("present_contests")) {
                    processContests(jsonResponse.getJSONArray("present_contests"), contests, true);
                }
                
                // Process future contests
                if (jsonResponse.has("future_contests")) {
                    processContests(jsonResponse.getJSONArray("future_contests"), contests, false);
                }
            }

            conn.disconnect();
            response.setActiveContests(contests);
            response.setStatus("SUCCESS");
            logger.info("Successfully fetched {} contests from CodeChef", contests.size());

        } catch (Exception e) {
            logger.error("Failed to fetch contests from CodeChef: {}", e.getMessage());
            response.setStatus("ERROR");
            response.setMessage(e.getMessage());
        }

        return response;
    }

    private void processContests(org.json.JSONArray contestsArray, List<CodeChefContest> contests, boolean isPresent) {
        for (int i = 0; i < contestsArray.length(); i++) {
            try {
                JSONObject contest = contestsArray.getJSONObject(i);
                String code = contest.optString("contest_code", "");
                String name = contest.optString("contest_name", "");
                String startDateStr = contest.optString("contest_start_date_iso", "");
                String endDateStr = contest.optString("contest_end_date_iso", "");
                String duration = contest.optString("contest_duration", "0");

                if (!name.isEmpty() && !startDateStr.isEmpty() && !endDateStr.isEmpty()) {
                    long startTime = Instant.parse(startDateStr).toEpochMilli();
                    long durationMs = Long.parseLong(duration) * 60 * 1000; // Convert minutes to milliseconds

                    String contestUrl = "https://www.codechef.com/" + code;
                    CodeChefContest contestObj = new CodeChefContest(
                        Math.abs(code.hashCode()),
                        name,
                        "CodeChef",
                        startTime,
                        durationMs,
                        contestUrl,
                        "",  // CodeChef API doesn't provide description
                        isPresent ? "ACTIVE" : "UPCOMING"
                    );
                    contests.add(contestObj);
                    logger.info("Added {} contest: {}", isPresent ? "active" : "upcoming", name);
                }
            } catch (Exception e) {
                logger.warn("Error processing contest at index {}: {}", i, e.getMessage());
            }
        }
    }
} 