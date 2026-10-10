package com.campusbrand.repository;

import com.campusbrand.model.Artwork;
import com.campusbrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtworkRepository extends JpaRepository<Artwork, Long> {

    List<Artwork> findByHiddenFalseOrderByCreatedAtDesc();

    List<Artwork> findByHiddenFalseAndCategoryIgnoreCaseOrderByCreatedAtDesc(String category);

    List<Artwork> findByCreatorAndHiddenFalseOrderByCreatedAtDesc(User creator);

    List<Artwork> findByCreatorOrderByCreatedAtDesc(User creator);

    List<Artwork> findByReportedTrueOrderByCreatedAtDesc();

    long countByHiddenFalse();

    long countByCreatorAndHiddenFalse(User creator);

    @Query("SELECT a FROM Artwork a WHERE a.hidden = false AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.creator.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Artwork> searchArtworks(@Param("query") String query);
}

