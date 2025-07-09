package com.codefolio.practiceService.repository;

import com.codefolio.practiceService.model.AptitudeQuestion; 
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AptitudeRepository extends JpaRepository<AptitudeQuestion, Long> {
    Optional<AptitudeQuestion> findById(Long id);
    List<AptitudeQuestion> findAll();
    AptitudeQuestion save(AptitudeQuestion question);
    void deleteById(Long id);
    List<AptitudeQuestion> findByTag(String tag);
}
