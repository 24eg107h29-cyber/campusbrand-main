package com.campusbrand.repository;

import com.campusbrand.model.Asset;
import com.campusbrand.model.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findAllByOrderByCreatedAtDesc();

    List<Asset> findByNameContainingIgnoreCaseOrderByCreatedAtDesc(String name);

    List<Asset> findByCategoryOrderByCreatedAtDesc(AssetCategory category);

    List<Asset> findByCategoryAndNameContainingIgnoreCaseOrderByCreatedAtDesc(AssetCategory category, String name);
}
