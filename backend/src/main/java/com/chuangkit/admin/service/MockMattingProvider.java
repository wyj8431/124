package com.chuangkit.admin.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.UUID;

/**
 * Local demo provider. It removes edge-connected pixels close to sampled corner
 * colors and writes a transparent PNG so the complete task/download flow is testable.
 */
@Component
public class MockMattingProvider implements MattingProvider {

    private static final int HARD_BACKGROUND_DISTANCE = 80;
    private static final int SOFT_BACKGROUND_DISTANCE = 160;

    private final Path uploadDirectory;
    private final String uploadBaseUrl;
    private final long delayMs;

    @Autowired
    public MockMattingProvider(
        @Value("${chuangkit.upload.base-url:http://localhost:8081/uploads}") String uploadBaseUrl,
        @Value("${chuangkit.ai.mock.delay-ms:1200}") long delayMs
    ) {
        this(Path.of(System.getProperty("user.dir"), "uploads"), uploadBaseUrl, delayMs);
    }

    MockMattingProvider(Path uploadDirectory, String uploadBaseUrl, long delayMs) {
        this.uploadDirectory = uploadDirectory.toAbsolutePath().normalize();
        this.uploadBaseUrl = uploadBaseUrl.replaceAll("/$", "");
        this.delayMs = Math.max(0, delayMs);
    }

    @Override
    public String process(String sourceUrl) throws Exception {
        if (delayMs > 0) {
            Thread.sleep(delayMs);
        }

        Path source = resolveSource(sourceUrl);
        BufferedImage input = ImageIO.read(source.toFile());
        if (input == null) {
            throw new IOException("演示 Provider 无法读取上传图片");
        }

        BufferedImage output = new BufferedImage(input.getWidth(), input.getHeight(), BufferedImage.TYPE_INT_ARGB);
        int[][] backgroundColors = sampleBackground(input);
        boolean[][] backgroundMask = findEdgeConnectedBackground(input, backgroundColors);
        for (int y = 0; y < input.getHeight(); y++) {
            for (int x = 0; x < input.getWidth(); x++) {
                int argb = input.getRGB(x, y);
                int sourceAlpha = (argb >>> 24) & 0xff;
                if (!backgroundMask[y][x] || isProtectedSubjectZone(x, y, input.getWidth(), input.getHeight())) {
                    output.setRGB(x, y, argb);
                    continue;
                }
                int red = (argb >>> 16) & 0xff;
                int green = (argb >>> 8) & 0xff;
                int blue = argb & 0xff;
                int distance = nearestBackgroundDistance(red, green, blue, backgroundColors);
                int alpha = Math.min(sourceAlpha, foregroundAlpha(distance));
                output.setRGB(x, y, (alpha << 24) | (red << 16) | (green << 8) | blue);
            }
        }

        Files.createDirectories(uploadDirectory);
        String filename = "matting-mock-" + UUID.randomUUID() + ".png";
        Path target = uploadDirectory.resolve(filename);
        if (!ImageIO.write(output, "png", target.toFile())) {
            throw new IOException("演示 Provider 无法生成透明图");
        }
        return uploadBaseUrl + "/" + filename;
    }

    private Path resolveSource(String sourceUrl) {
        if (sourceUrl == null || sourceUrl.isBlank()) {
            throw new IllegalArgumentException("演示 Provider 缺少源图片地址");
        }
        URI uri = URI.create(sourceUrl);
        String rawPath = uri.getPath();
        if (rawPath == null || rawPath.isBlank() || rawPath.contains("..")) {
            throw new IllegalArgumentException("演示 Provider 源图片地址无效");
        }
        String filename = Path.of(rawPath).getFileName().toString();
        if (!filename.matches("[A-Za-z0-9._-]+")) {
            throw new IllegalArgumentException("演示 Provider 源图片地址无效");
        }
        Path source = uploadDirectory.resolve(filename).normalize();
        if (!source.startsWith(uploadDirectory) || !Files.isRegularFile(source)) {
            throw new IllegalArgumentException("演示 Provider 找不到源图片");
        }
        return source;
    }

    private int[][] sampleBackground(BufferedImage image) {
        int[][] points = {
            {0, 0},
            {image.getWidth() - 1, 0},
            {0, image.getHeight() - 1},
            {image.getWidth() - 1, image.getHeight() - 1}
        };
        int[][] colors = new int[points.length][3];
        for (int i = 0; i < points.length; i++) {
            int rgb = image.getRGB(points[i][0], points[i][1]);
            colors[i][0] = (rgb >>> 16) & 0xff;
            colors[i][1] = (rgb >>> 8) & 0xff;
            colors[i][2] = rgb & 0xff;
        }
        return colors;
    }

    private boolean[][] findEdgeConnectedBackground(BufferedImage image, int[][] backgroundColors) {
        int width = image.getWidth();
        int height = image.getHeight();
        boolean[][] visited = new boolean[height][width];
        ArrayDeque<Integer> queue = new ArrayDeque<>();

        for (int x = 0; x < width; x++) {
            enqueueBackgroundPixel(image, backgroundColors, 0, x, visited, queue);
            enqueueBackgroundPixel(image, backgroundColors, height - 1, x, visited, queue);
        }
        for (int y = 1; y < height - 1; y++) {
            enqueueBackgroundPixel(image, backgroundColors, y, 0, visited, queue);
            enqueueBackgroundPixel(image, backgroundColors, y, width - 1, visited, queue);
        }

        int[] directions = {-1, 0, 1, 0, -1};
        while (!queue.isEmpty()) {
            int index = queue.removeFirst();
            int x = index % width;
            int y = index / width;
            for (int i = 0; i < 4; i++) {
                int nextX = x + directions[i];
                int nextY = y + directions[i + 1];
                if (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height) {
                    enqueueBackgroundPixel(image, backgroundColors, nextY, nextX, visited, queue);
                }
            }
        }
        return visited;
    }

    private void enqueueBackgroundPixel(
        BufferedImage image,
        int[][] backgroundColors,
        int y,
        int x,
        boolean[][] visited,
        ArrayDeque<Integer> queue
    ) {
        if (visited[y][x]) return;
        int rgb = image.getRGB(x, y);
        int red = (rgb >>> 16) & 0xff;
        int green = (rgb >>> 8) & 0xff;
        int blue = rgb & 0xff;
        if (nearestBackgroundDistance(red, green, blue, backgroundColors) > SOFT_BACKGROUND_DISTANCE) return;
        visited[y][x] = true;
        queue.add(y * image.getWidth() + x);
    }

    private int nearestBackgroundDistance(int red, int green, int blue, int[][] backgroundColors) {
        int nearest = Integer.MAX_VALUE;
        for (int[] background : backgroundColors) {
            nearest = Math.min(nearest, colorDistance(red, green, blue, background));
        }
        return nearest;
    }

    /**
     * The local demo has no semantic subject detector. Keep a conservative
     * central band opaque so light skin or clothing cannot be erased by a
     * background-color match; a real Provider replaces this heuristic.
     */
    private boolean isProtectedSubjectZone(int x, int y, int width, int height) {
        double centerX = width / 2.0;
        double centerY = height * 0.53;
        double radiusX = width * 0.34;
        double radiusY = height * 0.48;
        double normalizedX = (x - centerX) / radiusX;
        double normalizedY = (y - centerY) / radiusY;
        return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
    }

    private int colorDistance(int red, int green, int blue, int[] background) {
        return (int) Math.sqrt(
            Math.pow(red - background[0], 2)
                + Math.pow(green - background[1], 2)
                + Math.pow(blue - background[2], 2)
        );
    }

    private int foregroundAlpha(int distance) {
        if (distance <= HARD_BACKGROUND_DISTANCE) {
            return 0;
        }
        if (distance >= SOFT_BACKGROUND_DISTANCE) {
            return 255;
        }
        return (distance - HARD_BACKGROUND_DISTANCE) * 255
            / (SOFT_BACKGROUND_DISTANCE - HARD_BACKGROUND_DISTANCE);
    }
}
