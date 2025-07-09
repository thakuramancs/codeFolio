package com.codefolio.practiceService.model;
import jakarta.persistence.*;
import java.util.List;


@Entity
public class DSAQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String Title;
    private String difficulty;
    
    @ElementCollection
    private List<String> tag;
    private String link;
    private boolean solved;

    public Long getId() {
        return id;
    }
    public String getTitle() {
        return Title;
    }
    public void setTitle(String Title) {
        this.Title =Title;
    }
    public String getDifficulty() {
        return difficulty;
    }
    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
    public List<String> getTag() {
        return tag;
    }
    public void setTag(List<String> tag) {
        this.tag = tag;
    }
    public String getLink() {
        return link;
    }
    public void setLink(String link) {
        this.link = link;
    }
    public boolean isSolved() {
        return solved;
    }
    public void setSolved(boolean solved) {
        this.solved = solved;
    }

    
}
