package com.codefolio.contestService.Clients;

import com.codefolio.contestService.model.GFGContest;
import com.codefolio.contestService.model.GFGResponse;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.web.client.RestTemplate;
@Component
public class GFGClient {
    private static final Logger logger = LoggerFactory.getLogger(GFGClient.class);
    private static final String GFG_URL = "https://practiceapi.geeksforgeeks.org/api/v1/events?type=contest";
    
    public GFGResponse getActiveContests() {
        logger.info("Fetching active contests from GeeksforGeeks");
        GFGResponse response = new GFGResponse();
        List<GFGContest> contests = new ArrayList<>();
        
        try {
            URL url = new URL(GFG_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");
            conn.setRequestProperty("Accept", "application/json");
            
            if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String inputLine;
                StringBuilder content = new StringBuilder();
                while ((inputLine = in.readLine()) != null) {
                    content.append(inputLine);
                }
                in.close();
                
                JSONObject jsonResponse = new JSONObject(content.toString());
                JSONArray events = jsonResponse.getJSONArray("results");
                
                for (int i = 0; i < events.length(); i++) {
                    JSONObject event = events.getJSONObject(i);
                    String status = event.optString("status", "").toLowerCase();
                    
                    if (status.contains("active") || status.contains("ongoing")) {
                        String title = event.optString("name", "");
                        String description = event.optString("description", "");
                        String eventUrl = event.optString("register_url", "");
                        
                        if (!title.isEmpty()) {
                            if (!eventUrl.startsWith("http")) {
                                eventUrl = "https://practice.geeksforgeeks.org" + eventUrl;
                            }
                            
                            long startTime = System.currentTimeMillis();
                            long duration = TimeUnit.DAYS.toMillis(7);
                            
                            String startTimeStr = event.optString("start_time", "");
                            String endTimeStr = event.optString("end_time", "");
                            
                            try {
                                if (!startTimeStr.isEmpty()) {
                                    startTime = Long.parseLong(startTimeStr) * 1000L;
                                }
                                if (!endTimeStr.isEmpty()) {
                                    long endTime = Long.parseLong(endTimeStr) * 1000L;
                                    duration = endTime - startTime;
                                }
                            } catch (NumberFormatException e) {
                                logger.warn("Failed to parse time for contest {}", title);
                            }
                            
                            GFGContest contest = new GFGContest(
                                Math.abs(title.hashCode()),
                                title,
                                "GeeksforGeeks",
                                startTime,
                                duration,
                                eventUrl,
                                description,
                                "ACTIVE"
                            );
                            
                            contests.add(contest);
                            logger.info("Added contest: {}", title);
                        }
                    }
                }
            }
            
            conn.disconnect();
            response.setActiveContests(contests);
            response.setStatus("SUCCESS");
            logger.info("Successfully fetched {} contests", contests.size());
            
        } catch (Exception e) {
            logger.error("Failed to fetch contests: {}", e.getMessage());
            response.setStatus("ERROR");
            response.setMessage(e.getMessage());
        }
        
        return response;
    }
}