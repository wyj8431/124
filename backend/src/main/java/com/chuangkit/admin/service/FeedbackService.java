package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.*;
import com.chuangkit.admin.entity.FeedbackConfig;
import com.chuangkit.admin.entity.FeedbackTypeOption;
import com.chuangkit.admin.entity.UserFeedback;
import com.chuangkit.admin.mapper.FeedbackConfigMapper;
import com.chuangkit.admin.mapper.FeedbackTypeOptionMapper;
import com.chuangkit.admin.mapper.UserFeedbackMapper;
import com.chuangkit.admin.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackConfigMapper configMapper;
    private final FeedbackTypeOptionMapper typeOptionMapper;
    private final UserFeedbackMapper feedbackMapper;

    public FeedbackIndexDto getIndex() {
        FeedbackConfig config = requireConfig();

        FeedbackIndexDto dto = new FeedbackIndexDto();
        dto.setPageTitle(config.getPageTitle());
        dto.setIntroText(config.getIntroText());
        dto.setTypeQuestionLabel(config.getTypeQuestionLabel());
        dto.setFeedbackContentLabel(
            config.getFeedbackContentLabel() != null ? config.getFeedbackContentLabel() : "反馈意见填写");
        dto.setFeedbackContentDesc(
            config.getFeedbackContentDesc() != null
                ? config.getFeedbackContentDesc()
                : "请详细描述您遇到的问题、建议或使用体验");
        dto.setFeedbackContentPlaceholder(
            config.getFeedbackContentPlaceholder() != null
                ? config.getFeedbackContentPlaceholder()
                : "请输入您的反馈意见，我们会认真阅读并持续改进…");
        dto.setSubmitButtonText(config.getSubmitButtonText());
        dto.setHomeButtonText(config.getHomeButtonText() != null ? config.getHomeButtonText() : "返回首页");
        dto.setHomeLinkUrl(config.getHomeLinkUrl() != null ? config.getHomeLinkUrl() : "/");

        List<FeedbackTypeOption> options = typeOptionMapper.selectList(
            new LambdaQueryWrapper<FeedbackTypeOption>()
                .eq(FeedbackTypeOption::getStatus, 1)
                .orderByAsc(FeedbackTypeOption::getSortOrder));

        for (FeedbackTypeOption option : options) {
            FeedbackIndexDto.TypeOption item = new FeedbackIndexDto.TypeOption();
            item.setId(option.getId());
            item.setCode(option.getCode());
            item.setLabel(option.getLabel());
            dto.getTypeOptions().add(item);
        }

        return dto;
    }

    @Transactional
    public FeedbackSubmitResult submit(FeedbackSubmitRequest request) {
        FeedbackConfig config = requireConfig();

        boolean typeExists = typeOptionMapper.selectCount(
            new LambdaQueryWrapper<FeedbackTypeOption>()
                .eq(FeedbackTypeOption::getCode, request.getFeedbackTypeCode())
                .eq(FeedbackTypeOption::getStatus, 1)) > 0;
        if (!typeExists) {
            throw new BusinessException("请选择有效的问题类型");
        }

        UserFeedback feedback = new UserFeedback();
        feedback.setUserId(SecurityUtils.currentUserId());
        feedback.setFeedbackTypeCode(request.getFeedbackTypeCode());
        feedback.setFeedbackContent(trimToNull(request.getFeedbackContent()));
        feedbackMapper.insert(feedback);

        FeedbackSubmitResult result = new FeedbackSubmitResult();
        result.setSubmissionId(feedback.getId());
        result.setRedirectPath("/feedback/success/" + feedback.getId());
        return result;
    }

    public FeedbackSuccessDto getSuccess(Long submissionId) {
        FeedbackConfig config = requireConfig();

        UserFeedback feedback = feedbackMapper.selectById(submissionId);
        if (feedback == null) {
            throw new BusinessException("反馈记录不存在");
        }

        FeedbackSuccessDto dto = new FeedbackSuccessDto();
        dto.setSuccessTitle(config.getSuccessTitle());
        dto.setSuccessSubtitle(config.getSuccessSubtitle());
        dto.setRewardTitle(config.getRewardTitle());
        dto.setRewardSubtitle(config.getRewardSubtitle());
        dto.setClaimButtonText(config.getClaimButtonText());
        dto.setClaimLinkUrl(config.getClaimLinkUrl());
        dto.setHomeButtonText(config.getHomeButtonText() != null ? config.getHomeButtonText() : "返回首页");
        dto.setHomeLinkUrl(config.getHomeLinkUrl() != null ? config.getHomeLinkUrl() : "/");
        dto.setHeaderImageUrl(config.getHeaderImageUrl());

        dto.getSteps().add(step(1, "填写表单", "done"));
        dto.getSteps().add(step(2, "提交表单", "done"));
        dto.getSteps().add(step(3, "提取福利", "pending"));

        return dto;
    }

    private FeedbackConfig requireConfig() {
        FeedbackConfig config = configMapper.selectById(1L);
        if (config == null || config.getStatus() == null || config.getStatus() != 1) {
            throw new BusinessException("意见反馈页配置不存在");
        }
        return config;
    }

    private FeedbackSuccessDto.StepItem step(int num, String label, String status) {
        FeedbackSuccessDto.StepItem item = new FeedbackSuccessDto.StepItem();
        item.setStep(num);
        item.setLabel(label);
        item.setStatus(status);
        return item;
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
