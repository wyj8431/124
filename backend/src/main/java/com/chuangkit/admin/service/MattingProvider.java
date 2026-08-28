package com.chuangkit.admin.service;

/**
 * Provider boundary for background removal. The HTTP implementation stays in
 * MattingService so a real vendor can be configured without changing the API.
 */
@FunctionalInterface
public interface MattingProvider {
    String process(String sourceUrl) throws Exception;
}
