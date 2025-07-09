package com.codefolio.practiceService.repository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.codefolio.practiceService.model.DSAQuestion;

@Repository
public interface DSARepository extends JpaRepository<DSAQuestion, Long> {
    Optional<DSAQuestion> findById(Long id);
    List<DSAQuestion> findAll();
    DSAQuestion save(DSAQuestion question);
    void deleteById(Long id);
    List<DSAQuestion> findByDifficulty(String difficulty);
    List<DSAQuestion> findByTag(String tag);
}
