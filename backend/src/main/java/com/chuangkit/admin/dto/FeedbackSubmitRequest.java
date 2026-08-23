package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FeedbackSubmitRequest {
    @NotBlank
    private String feedbackTypeCode;
    @NotBlank
    private String feedbackContent;
}
