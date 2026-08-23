package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("feedback_config")
public class FeedbackConfig {
    @TableId(type = IdType.AUTO) private Long id;
    private String pageTitle;
    private String introText;
    private String typeQuestionLabel;
    private String feedbackContentLabel;
    private String feedbackContentDesc;
    private String feedbackContentPlaceholder;
    private String contactQuestionLabel;
    private String submitButtonText;
    private String successTitle;
    private String successSubtitle;
    private String rewardTitle;
    private String rewardSubtitle;
    private String claimButtonText;
    private String claimLinkUrl;
    private String homeButtonText;
    private String homeLinkUrl;
    private String headerImageUrl;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
