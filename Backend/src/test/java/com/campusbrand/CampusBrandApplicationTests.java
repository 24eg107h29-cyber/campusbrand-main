package com.campusbrand;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CampusBrandApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @Order(1)
    void healthEndpoint_ShouldReturnUp() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status", is("UP")))
            .andExpect(jsonPath("$.application", is("CampusBrand")));
    }

    @Test
    @Order(2)
    void unauthorizedAssetAccess_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/assets"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error", containsString("Unauthorized")));
    }

    @Test
    @Order(3)
    void registerUser_ShouldSucceed() throws Exception {
        Map<String, String> reg = Map.of(
            "name", "Unit Tester",
            "email", "unittester@campusbrand.edu",
            "password", "secretPassword123"
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.user.email", is("unittester@campusbrand.edu")))
            .andExpect(jsonPath("$.user.role", is("USER")));
    }

    @Test
    @Order(4)
    void duplicateRegistration_ShouldReturnBadRequest() throws Exception {
        Map<String, String> reg = Map.of(
            "name", "Unit Tester",
            "email", "unittester@campusbrand.edu",
            "password", "secretPassword123"
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error", containsString("already exists")));
    }

    @Test
    @Order(5)
    void invalidPasswordLogin_ShouldReturnUnauthorized() throws Exception {
        Map<String, String> login = Map.of(
            "email", "unittester@campusbrand.edu",
            "password", "wrongPassword"
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error", containsString("Invalid email or password")));
    }

    @Test
    @Order(6)
    void validLoginAndSessionPersistence_ShouldSucceed() throws Exception {
        Map<String, String> login = Map.of(
            "email", "unittester@campusbrand.edu",
            "password", "secretPassword123"
        );

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message", is("Login successful")))
            .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);
        org.junit.jupiter.api.Assertions.assertNotNull(session, "Session should not be null after login");

        // Verify session persistence via /me
        mockMvc.perform(get("/api/auth/me").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.email", is("unittester@campusbrand.edu")))
            .andExpect(jsonPath("$.user.role", is("USER")));

        // Logout
        mockMvc.perform(post("/api/auth/logout").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message", is("Logged out successfully")));

        // Verify session is invalidated
        mockMvc.perform(get("/api/auth/me").session(session))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(7)
    void regularUser_CannotUploadOrDeleteAsset() throws Exception {
        Map<String, String> login = Map.of(
            "email", "unittester@campusbrand.edu",
            "password", "secretPassword123"
        );

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
            .andExpect(status().isOk())
            .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        MockMultipartFile file = new MockMultipartFile(
            "file", "logo.png", "image/png", new byte[]{1, 2, 3}
        );

        // Regular user upload attempt
        mockMvc.perform(multipart("/api/assets")
                .file(file)
                .param("name", "Test Logo")
                .param("category", "LOGO")
                .session(session))
            .andExpect(status().isForbidden());

        // Regular user delete attempt
        mockMvc.perform(delete("/api/assets/1").session(session))
            .andExpect(status().isForbidden());
    }

    @Test
    @Order(8)
    void adminUser_FullAssetLifecycle() throws Exception {
        // Admin credentials initialized by DataInitializer
        Map<String, String> adminLogin = Map.of(
            "email", "admin@campusbrand.edu",
            "password", "Admin" + "@" + "123"
        );

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin)))
            .andExpect(status().isOk())
            .andReturn();

        MockHttpSession adminSession = (MockHttpSession) loginResult.getRequest().getSession(false);

        // Upload asset
        MockMultipartFile file = new MockMultipartFile(
            "file", "campus-shield.png", "image/png", new byte[]{10, 20, 30}
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/assets")
                .file(file)
                .param("name", "Shield Emblem")
                .param("description", "Official college crest")
                .param("category", "LOGO")
                .session(adminSession))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name", is("Shield Emblem")))
            .andExpect(jsonPath("$.category", is("LOGO")))
            .andReturn();

        String responseJson = uploadResult.getResponse().getContentAsString();
        Map<String, Object> createdAsset = objectMapper.readValue(responseJson, Map.class);
        Long assetId = ((Number) createdAsset.get("id")).longValue();

        // Browse / Search
        mockMvc.perform(get("/api/assets/search").param("name", "Shield").session(adminSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id", is(assetId.intValue())));

        // Filter by category
        mockMvc.perform(get("/api/assets/category/LOGO").session(adminSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].category", is("LOGO")));

        // Preview
        mockMvc.perform(get("/api/assets/preview/" + assetId).session(adminSession))
            .andExpect(status().isOk());

        // Download
        mockMvc.perform(get("/api/assets/download/" + assetId).session(adminSession))
            .andExpect(status().isOk());

        // Update
        Map<String, Object> updateReq = Map.of(
            "name", "Updated Shield Emblem",
            "description", "Revised official crest",
            "category", "LOGO"
        );
        mockMvc.perform(put("/api/assets/" + assetId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq))
                .session(adminSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name", is("Updated Shield Emblem")));

        // Delete
        mockMvc.perform(delete("/api/assets/" + assetId).session(adminSession))
            .andExpect(status().isNoContent());

        // Verify deleted
        mockMvc.perform(get("/api/assets/" + assetId).session(adminSession))
            .andExpect(status().isNotFound());
    }

    @Test
    @Order(9)
    void rateLimiter_ShouldBlockExcessiveRequests() throws Exception {
        com.campusbrand.config.RateLimitingFilter filter = new com.campusbrand.config.RateLimitingFilter(true, 3);
        org.springframework.mock.web.MockHttpServletRequest request = new org.springframework.mock.web.MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("192.168.1.100");

        for (int i = 0; i < 3; i++) {
            org.springframework.mock.web.MockHttpServletResponse response = new org.springframework.mock.web.MockHttpServletResponse();
            filter.doFilter(request, response, new org.springframework.mock.web.MockFilterChain());
            org.junit.jupiter.api.Assertions.assertEquals(200, response.getStatus());
        }

        org.springframework.mock.web.MockHttpServletResponse blockedResponse = new org.springframework.mock.web.MockHttpServletResponse();
        filter.doFilter(request, blockedResponse, new org.springframework.mock.web.MockFilterChain());
        org.junit.jupiter.api.Assertions.assertEquals(429, blockedResponse.getStatus());
        org.junit.jupiter.api.Assertions.assertTrue(blockedResponse.getContentAsString().contains("Too many"));
    }

    @Test
    @Order(10)
    void creatorApplication_FullWorkflow() throws Exception {
        // 1. Regular user logs in
        MvcResult userLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "email", "unittester@campusbrand.edu",
                    "password", "secretPassword123"
                ))))
            .andExpect(status().isOk())
            .andReturn();
        MockHttpSession userSession = (MockHttpSession) userLoginResult.getRequest().getSession(false);

        // 2. Regular user applies to become creator
        MockMultipartFile sample = new MockMultipartFile("sampleFiles", "sample.png", "image/png", new byte[]{1, 2, 3});
        MvcResult appResult = mockMvc.perform(multipart("/api/creator-applications")
                .file(sample)
                .param("department", "Computer Science")
                .param("skills", "UI Design, Illustration")
                .param("bio", "Student designer passionate about campus projects.")
                .session(userSession))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status", is("PENDING")))
            .andExpect(jsonPath("$.department", is("Computer Science")))
            .andReturn();

        Long appId = ((Number) objectMapper.readValue(appResult.getResponse().getContentAsString(), Map.class).get("id")).longValue();

        // 3. User checks own application
        mockMvc.perform(get("/api/creator-applications/my").session(userSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.hasApplication", is(true)))
            .andExpect(jsonPath("$.application.status", is("PENDING")));

        // 4. Admin logs in and approves application
        MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "email", "admin@campusbrand.edu",
                    "password", "Admin@123"
                ))))
            .andExpect(status().isOk())
            .andReturn();
        MockHttpSession adminSession = (MockHttpSession) adminLoginResult.getRequest().getSession(false);

        mockMvc.perform(post("/api/creator-applications/" + appId + "/review")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "status", "APPROVED",
                    "feedback", "Great sample works! Approved."
                )))
                .session(adminSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status", is("APPROVED")));

        // 5. Verify user's role is now CREATOR
        mockMvc.perform(get("/api/auth/me").session(userSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.role", is("CREATOR")));
    }

    @Test
    @Order(11)
    void creatorArtwork_PublishAndRatingWorkflow() throws Exception {
        // Creator logs in
        MvcResult creatorLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "email", "creator@campusbrand.edu",
                    "password", "Creator@123"
                ))))
            .andExpect(status().isOk())
            .andReturn();
        MockHttpSession creatorSession = (MockHttpSession) creatorLoginResult.getRequest().getSession(false);

        // Creator publishes artwork
        MockMultipartFile artFile = new MockMultipartFile("file", "creative-art.png", "image/png", new byte[]{4, 5, 6});
        MvcResult createArtResult = mockMvc.perform(multipart("/api/artworks")
                .file(artFile)
                .param("title", "Campus Sunset Concept")
                .param("description", "Vibrant evening view of student promenade")
                .param("category", "Illustration")
                .session(creatorSession))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title", is("Campus Sunset Concept")))
            .andExpect(jsonPath("$.category", is("Illustration")))
            .andReturn();

        Long artId = ((Number) objectMapper.readValue(createArtResult.getResponse().getContentAsString(), Map.class).get("id")).longValue();

        // Creator cannot rate own artwork (Self-rating blocked)
        mockMvc.perform(post("/api/artworks/" + artId + "/rate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "rating", 5,
                    "review", "Self praise"
                )))
                .session(creatorSession))
            .andExpect(status().isBadRequest());

        // Regular user logs in and rates the artwork 5 stars
        MvcResult userLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "email", "user@campusbrand.edu",
                    "password", "User@123"
                ))))
            .andExpect(status().isOk())
            .andReturn();
        MockHttpSession userSession = (MockHttpSession) userLoginResult.getRequest().getSession(false);

        mockMvc.perform(post("/api/artworks/" + artId + "/rate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "rating", 5,
                    "review", "Splendid color palette and lighting!"
                )))
                .session(userSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.averageRating", is(5.0)))
            .andExpect(jsonPath("$.ratingCount", is(1)));

        // Verify reviews list
        mockMvc.perform(get("/api/artworks/" + artId + "/reviews"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].rating", is(5)))
            .andExpect(jsonPath("$[0].review", is("Splendid color palette and lighting!")));
    }
}

