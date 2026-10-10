package com.campusbrand.controller;

import com.campusbrand.dto.CreatorProfileResponse;
import com.campusbrand.dto.CreatorProfileUpdateRequest;
import com.campusbrand.service.CreatorProfileService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/creators")
public class CreatorProfileController {

    private final CreatorProfileService profileService;

    public CreatorProfileController(CreatorProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public List<CreatorProfileResponse> listCreators() {
        return profileService.listApprovedCreators();
    }

    @GetMapping("/{id}")
    public CreatorProfileResponse getCreator(@PathVariable("id") Long id) {
        return profileService.getProfile(id);
    }

    @GetMapping("/me")
    public CreatorProfileResponse getMyProfile(Authentication authentication) {
        return profileService.getMyProfile(authentication.getName());
    }

    @PreAuthorize("hasRole('CREATOR') or hasRole('ADMIN')")
    @PutMapping("/me")
    public CreatorProfileResponse updateMyProfile(
        @Valid @RequestBody CreatorProfileUpdateRequest request,
        Authentication authentication
    ) {
        return profileService.updateMyProfile(request, authentication.getName());
    }
}

