package com.campusbrand.repository;

import com.campusbrand.model.Artwork;
import com.campusbrand.model.ArtworkRating;
import com.campusbrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArtworkRatingRepository extends JpaRepository<ArtworkRating, Long> {

    List<ArtworkRating> findByArtworkOrderByCreatedAtDesc(Artwork artwork);

    Optional<ArtworkRating> findByArtworkAndUser(Artwork artwork, User user);

    boolean existsByArtworkAndUser(Artwork artwork, User user);

    long countByArtwork(Artwork artwork);

    @Query("SELECT AVG(r.rating) FROM ArtworkRating r WHERE r.artwork = :artwork")
    Double findAverageRatingByArtwork(@Param("artwork") Artwork artwork);
}

