package com.codefolio.profileService.client;

import com.codefolio.profileService.dto.PlatformStatsDTO;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashMap;

@Component
public class AtCoderClient {
    private static final String ATCODER_URL = "https://atcoder.jp/users/%s";
    private static final String ATCODER_SUBMISSIONS_URL = "https://atcoder.jp/users/%s/submissions";
    private static final Logger log = LoggerFactory.getLogger(AtCoderClient.class);

    public PlatformStatsDTO getUserProfile(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "AtCoder username cannot be empty");
        }

        try {
            // Fetch user profile page
            Document doc = Jsoup.connect(String.format(ATCODER_URL, username))
                              .get();

            // Check if profile exists
            if (doc.select(".username").isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "AtCoder profile not found");
            }

            // Create stats object
            PlatformStatsDTO stats = new PlatformStatsDTO();
            
            // Get rating
            String ratingText = doc.select(".user-rating").text();
            stats.setRating(ratingText.isEmpty() ? 0 : Integer.parseInt(ratingText));
            
            // Get contest participation
            String contestsText = doc.select(".contest-participation-count").text();
            stats.setTotalContests(contestsText.isEmpty() ? 0 : Integer.parseInt(contestsText));
            
            // Get rank
            String rankText = doc.select(".user-rank").text();
            stats.setContestRanking(rankText.isEmpty() ? 0 : Integer.parseInt(rankText));
            
            // Get solved problems
            Document submissionsDoc = Jsoup.connect(String.format(ATCODER_SUBMISSIONS_URL, username))
                                         .get();
            String solvedText = submissionsDoc.select(".accepted-count").text();
            stats.setTotalQuestions(solvedText.isEmpty() ? 0 : Integer.parseInt(solvedText));
            
            // Set other stats
            stats.setTotalActiveDays(0); // AtCoder doesn't provide this
            stats.setDifficultyWiseSolved(new HashMap<>());
            stats.setTopicWiseSolved(new HashMap<>());
            stats.setSubmissionCalendar("");
            stats.setAwards("");

            return stats;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching AtCoder profile for {}: {}", username, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to process AtCoder profile data: " + e.getMessage());
        }
    }
} 