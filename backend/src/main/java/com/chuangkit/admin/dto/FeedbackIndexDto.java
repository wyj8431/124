package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class FeedbackIndexDto {
    private String pageTitle;
    private String introText;
    private String typeQuestionLabel;
    private String feedbackContentLabel;
    private String feedbackContentDesc;
    private String feedbackContentPlaceholder;
    private String submitButtonText;
    private String homeButtonText;
    private String homeLinkUrl;
    private List<TypeOption> typeOptions = new ArrayList<>();

    @Data
    public static class TypeOption {
        private Long id;
        private String code;
        private String label;
    }
}
