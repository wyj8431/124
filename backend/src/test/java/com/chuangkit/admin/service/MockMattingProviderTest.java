package com.chuangkit.admin.service;

import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MockMattingProviderTest {

    @Test
    void createsTransparentPngFromUploadedImage() throws Exception {
        Path uploadDir = Files.createTempDirectory("matting-upload-");
        BufferedImage source = new BufferedImage(9, 9, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < source.getHeight(); y++) {
            for (int x = 0; x < source.getWidth(); x++) {
                source.setRGB(x, y, (x >= 3 && x <= 5 && y >= 3 && y <= 5)
                    ? Color.BLACK.getRGB()
                    : Color.WHITE.getRGB());
            }
        }
        Path sourceFile = uploadDir.resolve("source.png");
        ImageIO.write(source, "png", sourceFile.toFile());

        MockMattingProvider provider = new MockMattingProvider(uploadDir, "http://localhost:8081/uploads", 0);
        String outputUrl = provider.process("http://localhost:8081/uploads/source.png");

        assertTrue(outputUrl.startsWith("http://localhost:8081/uploads/matting-mock-"));
        Path outputFile = uploadDir.resolve(outputUrl.substring(outputUrl.lastIndexOf('/') + 1));
        assertTrue(Files.exists(outputFile));
        BufferedImage output = ImageIO.read(outputFile.toFile());
        assertNotNull(output);
        assertEquals(0, (output.getRGB(0, 0) >>> 24) & 0xff);
        assertTrue(((output.getRGB(4, 4) >>> 24) & 0xff) > 0);
    }

    @Test
    void keepsLightForegroundPixelsThatAreEnclosedByAnOpaqueSubjectEdge() throws Exception {
        Path uploadDir = Files.createTempDirectory("matting-upload-");
        BufferedImage source = new BufferedImage(15, 15, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < source.getHeight(); y++) {
            for (int x = 0; x < source.getWidth(); x++) {
                source.setRGB(x, y, Color.WHITE.getRGB());
            }
        }
        for (int i = 3; i <= 11; i++) {
            source.setRGB(i, 3, Color.BLACK.getRGB());
            source.setRGB(i, 11, Color.BLACK.getRGB());
            source.setRGB(3, i, Color.BLACK.getRGB());
            source.setRGB(11, i, Color.BLACK.getRGB());
        }
        Path sourceFile = uploadDir.resolve("enclosed-subject.png");
        ImageIO.write(source, "png", sourceFile.toFile());

        MockMattingProvider provider = new MockMattingProvider(uploadDir, "http://localhost:8081/uploads", 0);
        String outputUrl = provider.process("http://localhost:8081/uploads/enclosed-subject.png");
        Path outputFile = uploadDir.resolve(outputUrl.substring(outputUrl.lastIndexOf('/') + 1));
        BufferedImage output = ImageIO.read(outputFile.toFile());

        assertEquals(0, (output.getRGB(0, 0) >>> 24) & 0xff);
        assertEquals(0, (output.getRGB(14, 14) >>> 24) & 0xff);
        assertTrue(((output.getRGB(7, 7) >>> 24) & 0xff) > 0);
    }

    @Test
    void preservesTheCentralSubjectZoneWhenLightForegroundConnectsToTheBackground() throws Exception {
        Path uploadDir = Files.createTempDirectory("matting-upload-");
        BufferedImage source = new BufferedImage(15, 15, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < source.getHeight(); y++) {
            for (int x = 0; x < source.getWidth(); x++) {
                source.setRGB(x, y, Color.WHITE.getRGB());
            }
        }
        source.setRGB(7, 7, new Color(250, 235, 220).getRGB());
        Path sourceFile = uploadDir.resolve("light-subject.png");
        ImageIO.write(source, "png", sourceFile.toFile());

        MockMattingProvider provider = new MockMattingProvider(uploadDir, "http://localhost:8081/uploads", 0);
        String outputUrl = provider.process("http://localhost:8081/uploads/light-subject.png");
        Path outputFile = uploadDir.resolve(outputUrl.substring(outputUrl.lastIndexOf('/') + 1));
        BufferedImage output = ImageIO.read(outputFile.toFile());

        assertEquals(0, (output.getRGB(0, 0) >>> 24) & 0xff);
        assertTrue(((output.getRGB(7, 7) >>> 24) & 0xff) > 0);
    }

    @Test
    void rejectsPathTraversalOutsideUploadDirectory() throws Exception {
        Path uploadDir = Files.createTempDirectory("matting-upload-");
        MockMattingProvider provider = new MockMattingProvider(uploadDir, "http://localhost:8081/uploads", 0);

        assertThrows(IllegalArgumentException.class,
            () -> provider.process("http://localhost:8081/uploads/../secret.png"));
        assertFalse(Files.list(uploadDir).findAny().isPresent());
    }
}
