package com.campusbrand.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Ellipse2D;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

/**
 * Generates genuine high-resolution PNG image assets and artworks
 * using standard Java AWT and ImageIO (100% native Java SE, no external dependencies).
 */
public final class DemoPngGenerator {

    private static final Logger log = LoggerFactory.getLogger(DemoPngGenerator.class);

    static {
        System.setProperty("java.awt.headless", "true");
    }

    private DemoPngGenerator() {
    }

    public static void generateAll(Path targetDir) {
        try {
            File dir = targetDir.toFile();
            if (!dir.exists()) {
                dir.mkdirs();
            }

            generateAnuragCrestLogo(new File(dir, "demo-anurag-crest-logo.png"));
            generateTechFestPoster(new File(dir, "demo-tech-fest-poster.png"));
            generateBannerTemplate(new File(dir, "demo-banner-template.png"));
            generateBrandGuidelines(new File(dir, "demo-brand-guidelines.png"));

            generateCyberSummitArtwork(new File(dir, "demo-art-cyber-summit.png"));
            generateLibraryArtwork(new File(dir, "demo-art-campus-library.png"));
            generateRoboconArtwork(new File(dir, "demo-art-robocon.png"));

            log.info("Successfully generated all demo PNG assets in {}", targetDir);
        } catch (Exception e) {
            log.error("Failed to generate demo PNG assets: {}", e.getMessage(), e);
        }
    }

    // 1. Anurag University Official Crest & Seal (800x800 PNG)
    private static void generateAnuragCrestLogo(File target) throws IOException {
        int w = 800, h = 800;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = setupGraphics(img);

        // White background with subtle border
        g.setColor(new Color(248, 250, 252));
        g.fillRect(0, 0, w, h);

        // Circular Seal Background (Dark Navy)
        int cx = 400, cy = 370;
        g.setColor(new Color(15, 23, 42));
        g.fill(new Ellipse2D.Double(cx - 280, cy - 280, 560, 560));

        // Outer Gold Ring
        g.setColor(new Color(234, 179, 8));
        g.setStroke(new BasicStroke(12f));
        g.draw(new Ellipse2D.Double(cx - 280, cy - 280, 560, 560));

        // Inner Gold Dotted/Thin Ring
        g.setStroke(new BasicStroke(3f));
        g.draw(new Ellipse2D.Double(cx - 250, cy - 250, 500, 500));

        // Center Crest Shield
        g.setColor(new Color(30, 41, 59));
        RoundRectangle2D shield = new RoundRectangle2D.Double(cx - 150, cy - 130, 300, 260, 30, 30);
        g.fill(shield);
        g.setColor(new Color(250, 204, 21));
        g.setStroke(new BasicStroke(6f));
        g.draw(shield);

        // Stylized University 'A' / Flame in Center
        g.setColor(new Color(250, 204, 21));
        Polygon flame = new Polygon();
        flame.addPoint(cx, cy - 90);
        flame.addPoint(cx + 65, cy + 50);
        flame.addPoint(cx + 25, cy + 30);
        flame.addPoint(cx, cy + 70);
        flame.addPoint(cx - 25, cy + 30);
        flame.addPoint(cx - 65, cy + 50);
        g.fill(flame);

        // Laurels on sides
        g.setColor(new Color(202, 138, 4));
        g.setFont(new Font("SansSerif", Font.BOLD, 22));
        g.drawString("★ ★ ★", cx - 35, cy + 115);

        // Circular Text Simulation
        g.setColor(Color.WHITE);
        g.setFont(new Font("Serif", Font.BOLD, 30));
        drawCenteredString(g, "ANURAG UNIVERSITY", cx, cy - 190);
        g.setFont(new Font("Serif", Font.BOLD, 20));
        g.setColor(new Color(234, 179, 8));
        drawCenteredString(g, "• ESTD 2002 •", cx, cy + 205);

        // Bottom Banner Header
        g.setColor(new Color(15, 23, 42));
        g.setFont(new Font("SansSerif", Font.BOLD, 32));
        drawCenteredString(g, "ANURAG UNIVERSITY", cx, 710);
        g.setColor(new Color(100, 116, 139));
        g.setFont(new Font("SansSerif", Font.PLAIN, 18));
        drawCenteredString(g, "OFFICIAL INSTITUTIONAL SEAL & ACADEMIC CREST", cx, 745);

        g.dispose();
        ImageIO.write(img, "PNG", target);
    }

    // 2. Innovision 2026 Tech Symposium Poster (800x1100 PNG)
    private static void generateTechFestPoster(File target) throws IOException {
        int w = 800, h = 1100;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = setupGraphics(img);

        // Deep Indigo/Violet Gradient
        GradientPaint gp = new GradientPaint(0, 0, new Color(15, 23, 42), 0, h, new Color(49, 46, 129));
        g.setPaint(gp);
        g.fillRect(0, 0, w, h);

        // Abstract Tech Grid Background Lines
        g.setColor(new Color(99, 102, 241, 40));
        g.setStroke(new BasicStroke(1.5f));
        for (int i = 0; i < w; i += 60) {
            g.drawLine(i, 0, i, h);
        }
        for (int i = 0; i < h; i += 60) {
            g.drawLine(0, i, w, i);
        }

        // Top Institutional Bar
        g.setColor(new Color(255, 255, 255, 220));
        g.setFont(new Font("SansSerif", Font.BOLD, 18));
        g.drawString("ANURAG UNIVERSITY • DEPARTMENT OF COMPUTER SCIENCE & ENGG", 60, 80);

        // Glowing Tech Emblem Accent
        g.setColor(new Color(129, 140, 248));
        g.draw(new Ellipse2D.Double(400 - 120, 280 - 120, 240, 240));
        g.setColor(new Color(99, 102, 241, 60));
        g.fill(new Ellipse2D.Double(400 - 100, 280 - 100, 200, 200));

        // Center Symbol
        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 72));
        drawCenteredString(g, "⚡", 400, 305);

        // Main Poster Title
        g.setColor(new Color(255, 255, 255));
        g.setFont(new Font("SansSerif", Font.BOLD, 74));
        drawCenteredString(g, "INNOVISION", 400, 500);

        g.setColor(new Color(165, 180, 252));
        g.setFont(new Font("SansSerif", Font.BOLD, 36));
        drawCenteredString(g, "2 0 2 6", 400, 555);

        // Tagline
        g.setColor(new Color(226, 232, 240));
        g.setFont(new Font("SansSerif", Font.PLAIN, 22));
        drawCenteredString(g, "NATIONAL TECH SYMPOSIUM & 24-HOUR HACKATHON", 400, 620);

        // Details Pill Container
        g.setColor(new Color(30, 41, 59, 200));
        g.fill(new RoundRectangle2D.Double(100, 690, 600, 160, 24, 24));
        g.setColor(new Color(99, 102, 241));
        g.setStroke(new BasicStroke(2f));
        g.draw(new RoundRectangle2D.Double(100, 690, 600, 160, 24, 24));

        g.setColor(new Color(250, 204, 21));
        g.setFont(new Font("SansSerif", Font.BOLD, 22));
        drawCenteredString(g, "★ KEY EVENTS & TRACKS ★", 400, 735);

        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.PLAIN, 18));
        drawCenteredString(g, "AI & Machine Learning • Web3 Security • IoT Robotics • Cloud Dev", 400, 775);
        drawCenteredString(g, "Cash Prizes worth ₹1,50,000 • Merit Certificates & Swag", 400, 810);

        // Bottom Date & Venue
        g.setColor(new Color(248, 250, 252));
        g.setFont(new Font("SansSerif", Font.BOLD, 26));
        drawCenteredString(g, "OCTOBER 24 - 26, 2026", 400, 930);

        g.setColor(new Color(148, 163, 184));
        g.setFont(new Font("SansSerif", Font.PLAIN, 20));
        drawCenteredString(g, "MAIN CAMPUS AUDITORIUM & INNOVATION HUB", 400, 970);
        drawCenteredString(g, "Open to All Undergraduate & Postgraduate Engineering Students", 400, 1010);

        g.dispose();
        ImageIO.write(img, "PNG", target);
    }

    // 3. Social Media Banner Template (1200x675 PNG - 16:9)
    private static void generateBannerTemplate(File target) throws IOException {
        int w = 1200, h = 675;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = setupGraphics(img);

        // Sleek Dual Gradient Background
        GradientPaint gp = new GradientPaint(0, 0, new Color(15, 23, 42), w, h, new Color(30, 58, 138));
        g.setPaint(gp);
        g.fillRect(0, 0, w, h);

        // Grid Design Guides / Rulers
        g.setColor(new Color(255, 255, 255, 30));
        g.setStroke(new BasicStroke(1f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 10f, new float[]{6f, 6f}, 0f));
        g.drawRect(60, 60, w - 120, h - 120);

        // Badge
        g.setColor(new Color(59, 130, 246));
        g.fill(new RoundRectangle2D.Double(80, 80, 240, 36, 12, 12));
        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 14));
        drawCenteredString(g, "OFFICIAL TEMPLATE / 16:9", 200, 103);

        // Title
        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 52));
        g.drawString("STUDENT ACTIVITY CHAPTER", 80, 210);

        g.setColor(new Color(147, 197, 253));
        g.setFont(new Font("SansSerif", Font.BOLD, 38));
        g.drawString("Campus Guest Lecture & Workshop Series", 80, 275);

        // Descriptive placeholder box
        g.setColor(new Color(255, 255, 255, 15));
        g.fill(new RoundRectangle2D.Double(80, 320, 600, 150, 16, 16));
        g.setColor(new Color(255, 255, 255, 50));
        g.setStroke(new BasicStroke(1.5f));
        g.draw(new RoundRectangle2D.Double(80, 320, 600, 150, 16, 16));

        g.setColor(new Color(226, 232, 240));
        g.setFont(new Font("SansSerif", Font.PLAIN, 20));
        g.drawString("• Topic: Industry 4.0 Architecture & Cloud Native Patterns", 110, 370);
        g.drawString("• Speaker: Tech Lead & Alumni Keynote Speaker", 110, 410);
        g.drawString("• Eligibility: Open to all departments & technical societies", 110, 450);

        // Right side Visual Box
        g.setColor(new Color(30, 41, 59, 200));
        g.fill(new RoundRectangle2D.Double(740, 160, 380, 380, 24, 24));
        g.setColor(new Color(96, 165, 250));
        g.setStroke(new BasicStroke(3f));
        g.draw(new RoundRectangle2D.Double(740, 160, 380, 380, 24, 24));

        g.setColor(new Color(191, 219, 254));
        g.setFont(new Font("SansSerif", Font.BOLD, 28));
        drawCenteredString(g, "SPEAKER / LOGO", 930, 320);
        g.setFont(new Font("SansSerif", Font.PLAIN, 18));
        drawCenteredString(g, "Place photo or crest here", 930, 360);

        // Footer
        g.setColor(new Color(148, 163, 184));
        g.setFont(new Font("SansSerif", Font.PLAIN, 18));
        g.drawString("ANURAG UNIVERSITY • VERIFIED BRAND ASSET PORTAL • 2026 EDITION", 80, 580);

        g.dispose();
        ImageIO.write(img, "PNG", target);
    }

    // 4. Campus Brand Guidelines (1000x750 PNG)
    private static void generateBrandGuidelines(File target) throws IOException {
        int w = 1000, h = 750;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = setupGraphics(img);

        // Clean Paper White Background
        g.setColor(new Color(248, 250, 252));
        g.fillRect(0, 0, w, h);

        // Dark Top Header Banner
        g.setColor(new Color(15, 23, 42));
        g.fillRect(0, 0, w, 110);

        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 30));
        g.drawString("ANURAG UNIVERSITY • VISUAL IDENTITY STANDARDS", 50, 65);

        g.setColor(new Color(148, 163, 184));
        g.setFont(new Font("SansSerif", Font.PLAIN, 16));
        g.drawString("OFFICIAL COLOR PALETTE & TYPOGRAPHY SYSTEM • VERSION 2.4", 50, 92);

        // Color Palette Section Title
        g.setColor(new Color(15, 23, 42));
        g.setFont(new Font("SansSerif", Font.BOLD, 24));
        g.drawString("1. Institutional Color Palette", 50, 165);

        // 4 Color Swatches
        int sx = 50, sy = 190, sw = 205, sh = 130;
        drawColorSwatch(g, sx, sy, sw, sh, new Color(15, 23, 42), "Obsidian Navy", "#0F172A", "Primary Background");
        drawColorSwatch(g, sx + 225, sy, sw, sh, new Color(67, 56, 202), "Academic Indigo", "#4338CA", "Primary Brand");
        drawColorSwatch(g, sx + 450, sy, sw, sh, new Color(99, 102, 241), "Digital Violet", "#6366F1", "Secondary Accent");
        drawColorSwatch(g, sx + 675, sy, sw, sh, new Color(248, 250, 252), "Canvas Pearl", "#F8FAFC", "Light Neutral");

        // Typography Section Title
        g.setColor(new Color(15, 23, 42));
        g.setFont(new Font("SansSerif", Font.BOLD, 24));
        g.drawString("2. Approved Typography & Hierarchy", 50, 390);

        // Typography Card
        g.setColor(Color.WHITE);
        g.fill(new RoundRectangle2D.Double(50, 420, 900, 240, 16, 16));
        g.setColor(new Color(226, 232, 240));
        g.setStroke(new BasicStroke(1.5f));
        g.draw(new RoundRectangle2D.Double(50, 420, 900, 240, 16, 16));

        g.setColor(new Color(67, 56, 202));
        g.setFont(new Font("Serif", Font.ITALIC | Font.BOLD, 36));
        g.drawString("Playfair Display — For Elegant Headlines & Honorifics", 80, 475);

        g.setColor(new Color(15, 23, 42));
        g.setFont(new Font("SansSerif", Font.BOLD, 26));
        g.drawString("DM Sans / Inter — For Clean Body Copy & Technical Layouts", 80, 525);

        g.setColor(new Color(100, 116, 139));
        g.setFont(new Font("Monospaced", Font.BOLD, 20));
        g.drawString("DM Mono — FOR LABELS, BADGES & CATEGORY IDENTIFIERS", 80, 575);

        g.setColor(new Color(148, 163, 184));
        g.setFont(new Font("SansSerif", Font.PLAIN, 16));
        g.drawString("Maintain a minimum clearspace equal to 50% of the crest height around all institutional marks.", 80, 625);

        g.dispose();
        ImageIO.write(img, "PNG", target);
    }

    private static void drawColorSwatch(Graphics2D g, int x, int y, int w, int h, Color col, String name, String hex, String role) {
        g.setColor(col);
        g.fill(new RoundRectangle2D.Double(x, y, w, h, 14, 14));
        g.setColor(new Color(0, 0, 0, 30));
        g.setStroke(new BasicStroke(1f));
        g.draw(new RoundRectangle2D.Double(x, y, w, h, 14, 14));

        boolean isDark = (col.getRed() * 0.299 + col.getGreen() * 0.587 + col.getBlue() * 0.114) < 180;
        g.setColor(isDark ? Color.WHITE : new Color(15, 23, 42));
        g.setFont(new Font("SansSerif", Font.BOLD, 16));
        g.drawString(name, x + 15, y + 40);

        g.setFont(new Font("Monospaced", Font.BOLD, 15));
        g.drawString(hex, x + 15, y + 70);

        g.setFont(new Font("SansSerif", Font.PLAIN, 12));
        g.drawString(role, x + 15, y + 100);
    }

    // 5. CyberShield 2026 Summit Identity (Artwork 800x800 PNG)
    private static void generateCyberSummitArtwork(File target) throws IOException {
        int w = 800, h = 800;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = setupGraphics(img);

        // Cyber Dark Slate Background
        g.setColor(new Color(9, 13, 22));
        g.fillRect(0, 0, w, h);

        // Cyan Radial Shield Grid
        int cx = 400, cy = 340;
        g.setColor(new Color(6, 182, 212, 35));
        for (int r = 80; r <= 280; r += 40) {
            g.draw(new Ellipse2D.Double(cx - r, cy - r, r * 2, r * 2));
        }

        // Cyber Shield Polygon
        Polygon shield = new Polygon();
        shield.addPoint(cx, cy - 140);
        shield.addPoint(cx + 120, cy - 60);
        shield.addPoint(cx + 90, cy + 90);
        shield.addPoint(cx, cy + 170);
        shield.addPoint(cx - 90, cy + 90);
        shield.addPoint(cx - 120, cy - 60);

        g.setColor(new Color(14, 116, 144));
        g.fill(shield);
        g.setColor(new Color(34, 211, 238));
        g.setStroke(new BasicStroke(8f));
        g.draw(shield);

        // Padlock icon in center
        g.setColor(Color.WHITE);
        g.fill(new RoundRectangle2D.Double(cx - 45, cy - 10, 90, 80, 16, 16));
        g.setStroke(new BasicStroke(10f));
        g.draw(new Ellipse2D.Double(cx - 30, cy - 60, 60, 60));

        // Keyhole
        g.setColor(new Color(9, 13, 22));
        g.fill(new Ellipse2D.Double(cx - 10, cy + 15, 20, 20));
        g.fillRect(cx - 5, cy + 25, 10, 25);

        // Typography
        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 46));
        drawCenteredString(g, "CYBERSHIELD '26", cx, 600);

        g.setColor(new Color(34, 211, 238));
        g.setFont(new Font("SansSerif", Font.BOLD, 22));
        drawCenteredString(g, "INTER-COLLEGIATE CTF & CYBERSECURITY SUMMIT", cx, 645);

        g.setColor(new Color(148, 163, 184));
        g.setFont(new Font("SansSerif", Font.PLAIN, 18));
        drawCenteredString(g, "ORIGINAL CREATIVE PORTFOLIO • AARAV SHARMA", cx, 690);

        g.dispose();
        ImageIO.write(img, "PNG", target);
    }

    // 6. Dawn at the Central Library (Artwork 800x800 PNG)
    private static void generateLibraryArtwork(File target) throws IOException {
        int w = 800, h = 800;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = setupGraphics(img);

        // Sunrise Sky Gradient (Amber to Rose to Violet)
        GradientPaint gp = new GradientPaint(0, 0, new Color(254, 215, 170), 0, 500, new Color(192, 132, 252));
        g.setPaint(gp);
        g.fillRect(0, 0, w, 500);

        // Ground / Reflection
        g.setColor(new Color(30, 27, 75));
        g.fillRect(0, 500, w, 300);

        // Sun
        g.setColor(new Color(254, 240, 138, 200));
        g.fill(new Ellipse2D.Double(400 - 90, 260 - 90, 180, 180));

        // Architectural Silhouette of Library Dome & Columns
        g.setColor(new Color(49, 46, 129));
        // Dome
        g.fill(new Ellipse2D.Double(400 - 150, 200, 300, 200));
        // Main block
        g.fillRect(150, 300, 500, 200);

        // Columns Cutouts (Sky showing through)
        g.setColor(new Color(254, 215, 170));
        for (int x = 200; x <= 560; x += 60) {
            g.fill(new RoundRectangle2D.Double(x, 340, 30, 140, 12, 12));
        }

        // Title text in dark foreground
        g.setColor(Color.WHITE);
        g.setFont(new Font("Serif", Font.BOLD, 42));
        drawCenteredString(g, "Dawn at the Central Library", 400, 600);

        g.setColor(new Color(216, 180, 254));
        g.setFont(new Font("SansSerif", Font.PLAIN, 20));
        drawCenteredString(g, "ARCHITECTURAL VECTOR STUDY • CAMPUS HERITAGE", 400, 650);

        g.setColor(new Color(165, 180, 252));
        g.setFont(new Font("SansSerif", Font.PLAIN, 16));
        drawCenteredString(g, "Illustrated by Aarav Sharma • Department of Design & Media", 400, 690);

        g.dispose();
        ImageIO.write(img, "PNG", target);
    }

    // 7. Robocon 2026 Key Visual (Artwork 800x800 PNG)
    private static void generateRoboconArtwork(File target) throws IOException {
        int w = 800, h = 800;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = setupGraphics(img);

        // Deep Industrial Slate Background
        g.setColor(new Color(24, 24, 27));
        g.fillRect(0, 0, w, h);

        int cx = 400, cy = 330;

        // Orange Gear Outer Teeth
        g.setColor(new Color(234, 88, 12));
        for (int angle = 0; angle < 360; angle += 30) {
            double rad = Math.toRadians(angle);
            int gx = (int) (cx + Math.cos(rad) * 160);
            int gy = (int) (cy + Math.sin(rad) * 160);
            g.fill(new RoundRectangle2D.Double(gx - 20, gy - 20, 40, 40, 8, 8));
        }

        // Central Gear Body
        g.setColor(new Color(249, 115, 22));
        g.fill(new Ellipse2D.Double(cx - 150, cy - 150, 300, 300));

        // Dark Core
        g.setColor(new Color(24, 24, 27));
        g.fill(new Ellipse2D.Double(cx - 90, cy - 90, 180, 180));

        // Circuit Hexagon
        g.setColor(new Color(254, 215, 170));
        g.setStroke(new BasicStroke(6f));
        g.draw(new Ellipse2D.Double(cx - 45, cy - 45, 90, 90));

        // Robotic Arm Geometric Beam
        g.setColor(new Color(249, 115, 22));
        g.setStroke(new BasicStroke(14f));
        g.drawLine(cx, cy - 90, cx + 180, cy - 180);
        g.drawLine(cx + 180, cy - 180, cx + 240, cy - 140);

        // Title
        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 50));
        drawCenteredString(g, "ROBOCON 2026", cx, 580);

        g.setColor(new Color(249, 115, 22));
        g.setFont(new Font("SansSerif", Font.BOLD, 22));
        drawCenteredString(g, "AUTONOMOUS MECHATRONICS NATIONAL CHALLENGE", cx, 630);

        g.setColor(new Color(161, 161, 170));
        g.setFont(new Font("SansSerif", Font.PLAIN, 18));
        drawCenteredString(g, "Student Creator Portfolio • Robotics Chapter Key Visual", cx, 675);

        g.dispose();
        ImageIO.write(img, "PNG", target);
    }

    private static Graphics2D setupGraphics(BufferedImage img) {
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        return g;
    }

    private static void drawCenteredString(Graphics2D g, String text, int x, int y) {
        FontMetrics fm = g.getFontMetrics();
        int textX = x - (fm.stringWidth(text) / 2);
        g.drawString(text, textX, y);
    }
}

