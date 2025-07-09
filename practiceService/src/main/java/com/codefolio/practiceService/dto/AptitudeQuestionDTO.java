package com.codefolio.practiceService.dto;

import java.util.List;

public class AptitudeQuestionDTO {
    private Long id;
    private String title;
    private List<String> options;
    private String answer;
    private List<String> tag;

    public AptitudeQuestionDTO(Long id, String title, List<String> options, String answer, List<String> tag) {
        this.id = id;
        this.title = title;
        this.options = options;
        this.answer = answer;
        this.tag = tag;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public List<String> getOptions() { return options; }
    public String getAnswer() { return answer; }
    public List<String> getTag() { return tag; }
}
