package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class FeedbackSuccessDto {
    private String successTitle;
    private String successSubtitle;
    private String rewardTitle;
    private String rewardSubtitle;
    private String claimButtonText;
    private String claimLinkUrl;
    private String homeButtonText;
    private String homeLinkUrl;
    private String headerImageUrl;
    private List<StepItem> steps = new ArrayList<>();

    @Data
    public static class StepItem {
        private int step;
        private String label;
        private String status;
    }
}
