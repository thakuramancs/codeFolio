package com.codefolio.contestService.Clients;

import com.codefolio.contestService.model.HackerRankContest;
import com.codefolio.contestService.model.HackerRankResponse;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class HackerRankClient {
    private static final Logger logger = LoggerFactory.getLogger(HackerRankClient.class);
    private static final String HACKERRANK_CONTESTS_URL = "https://www.hackerrank.com/contests";
    
    public HackerRankResponse getUpcomingContests() {
        logger.info("Fetching upcoming contests from HackerRank");
        return getContests("upcoming-contests-container", "UPCOMING");
    }

    public HackerRankResponse getActiveContests() {
        logger.info("Fetching active contests from HackerRank");
        return getContests("active-contest-container", "ACTIVE");
    }

    private HackerRankResponse getContests(String containerClass, String status) {
        HackerRankResponse response = new HackerRankResponse();
        List<HackerRankContest> contests = new ArrayList<>();
        
        try {
            logger.debug("Connecting to HackerRank contests page");
            Document doc = Jsoup.connect(HACKERRANK_CONTESTS_URL)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .get();

            // Find all contest cards within the container
            Elements contestCards = doc.select("div." + containerClass + " div.contests-list-view, " +
                                            "div." + containerClass + " div.promoted-contest-v2__card, " +
                                            "div." + containerClass + " div.c-bQZNxM");
            logger.debug("Found {} contest cards in container {}", contestCards.size(), containerClass);
            
            for (Element card : contestCards) {
                // Try both regular and promoted contest selectors
                Element titleElement = card.selectFirst("div.contest-item__heading, h3.promoted-contest-v2__name, h4.hr-title-sm");
                Element timeElement = card.selectFirst("div.contest-item__time, div.hr-subtitle-sm, div.contest-item__time-ended");
                Element linkElement = card.selectFirst("a[href], button[data-attr1], [data-analytics=ContestPromoted], a.contest-item-btn");
                Element descElement = card.selectFirst("p.promoted-contest-v2__desc, div.contest-item__description");
                
                if (titleElement != null) {
                    String title = titleElement.text().trim();
                    String description = descElement != null ? descElement.text().trim() : "";
                    String url = "";
                    
                    if (linkElement != null) {
                        if (linkElement.hasAttr("href")) {
                            url = linkElement.attr("href");
                        } else if (linkElement.hasAttr("data-attr1")) {
                            url = linkElement.attr("data-attr1");
                        }
                        
                        if (!url.isEmpty() && !url.startsWith("http")) {
                            url = "https://www.hackerrank.com" + url;
                        }
                    }
                    
                    long currentTime = System.currentTimeMillis();
                    long duration = TimeUnit.DAYS.toMillis(30); // Default duration
                    
                    if (timeElement != null) {
                        String timeText = timeElement.text().trim();
                        logger.debug("Contest time text: {}", timeText);
                        
                        if (timeText.contains("Open Indefinitely") || timeText.equals("Open")) {
                            duration = TimeUnit.DAYS.toMillis(365 * 10); // 10 years for indefinite contests
                        } else if (timeText.contains("open till")) {
                            duration = TimeUnit.DAYS.toMillis(30); // 30 days for registration-based contests
                        } else {
                            duration = TimeUnit.DAYS.toMillis(7); // 7 days for regular contests
                        }
                    }
                    
                    HackerRankContest contest = new HackerRankContest(
                        Math.abs(title.hashCode()),  // id
                        title,                       // name
                        "HackerRank",               // platform
                        currentTime,                // startTime
                        duration,                   // duration
                        url,                        // url
                        description,                // description
                        status                      // status
                    );
                    
                    contests.add(contest);
                    logger.debug("Added contest: {}", title);
                }
            }
            
            response.setModels(contests);
            response.setStatus("SUCCESS");
            logger.info("Successfully fetched {} contests from container {}", contests.size(), containerClass);
            
        } catch (IOException e) {
            logger.error("Failed to fetch contests from HackerRank: {}", e.getMessage(), e);
            response.setStatus("ERROR");
            response.setMessage("Failed to fetch contests: " + e.getMessage());
        }
        
        return response;
    }
}