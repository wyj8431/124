package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.*;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import com.chuangkit.admin.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiTopicService {

    private final AiTopicPageMapper pageMapper;
    private final AiTopicPresetMapper presetMapper;
    private final AiTopicSectionMapper sectionMapper;
    private final AiTopicInspirationMapper inspirationMapper;
    private final AiGenerateService aiGenerateService;

    public AiTopicIndexDto getIndex(String code) {
        AiTopicPage page = pageMapper.selectOne(
            new LambdaQueryWrapper<AiTopicPage>()
                .eq(AiTopicPage::getCode, code)
                .eq(AiTopicPage::getStatus, 1));
        if (page == null) {
            throw new BusinessException("专题页不存在");
        }

        AiTopicIndexDto dto = new AiTopicIndexDto();
        dto.setCode(page.getCode());
        dto.setTitle(page.getTitle());
        dto.setBreadcrumbParent(page.getBreadcrumbParent());
        dto.setBreadcrumbParentUrl(page.getBreadcrumbParentUrl());
        dto.setPromptPlaceholder(page.getPromptPlaceholder());
        dto.setGenerateButtonText(page.getGenerateButtonText());

        List<AiTopicPreset> presets = presetMapper.selectList(
            new LambdaQueryWrapper<AiTopicPreset>()
                .eq(AiTopicPreset::getPageCode, code)
                .eq(AiTopicPreset::getStatus, 1)
                .orderByAsc(AiTopicPreset::getSortOrder));
        dto.setPresets(presets.stream().map(this::toPresetDto).collect(Collectors.toList()));

        List<AiTopicSection> sections = sectionMapper.selectList(
            new LambdaQueryWrapper<AiTopicSection>()
                .eq(AiTopicSection::getPageCode, code)
                .eq(AiTopicSection::getStatus, 1)
                .orderByAsc(AiTopicSection::getSortOrder));

        dto.setSections(sections.stream().map(section -> {
            AiTopicSectionDto sectionDto = new AiTopicSectionDto();
            sectionDto.setId(section.getId());
            sectionDto.setTitle(section.getTitle());
            sectionDto.setEmoji(section.getEmoji());
            sectionDto.setDisplayTitle(
                (section.getEmoji() != null ? section.getEmoji() : "") + section.getTitle());
            sectionDto.setMoreText(section.getMoreText());
            sectionDto.setMoreLink(section.getMoreLink());

            List<AiTopicInspiration> items = inspirationMapper.selectList(
                new LambdaQueryWrapper<AiTopicInspiration>()
                    .eq(AiTopicInspiration::getSectionId, section.getId())
                    .eq(AiTopicInspiration::getStatus, 1)
                    .orderByAsc(AiTopicInspiration::getSortOrder));
            sectionDto.setItems(items.stream().map(this::toInspirationDto).collect(Collectors.toList()));
            return sectionDto;
        }).collect(Collectors.toList()));

        return dto;
    }

    public Map<String, Object> generate(String code, AiTopicGenerateRequest request) {
        requirePage(code);

        String prompt = resolvePrompt(code, request);
        if (!StringUtils.hasText(prompt)) {
            throw new BusinessException("请输入描述或选择灵感模板");
        }

        AiGenerateRequest genReq = new AiGenerateRequest();
        genReq.setPrompt(prompt.trim());
        if ("AIhaibao".equalsIgnoreCase(code) || "aihaibao".equalsIgnoreCase(code)) {
            genReq.setMode("image_gen");
            genReq.setToolCode("ai_poster");
        } else {
            genReq.setMode("video_gen");
            genReq.setToolCode("ai_video");
        }

        return aiGenerateService.generate(SecurityUtils.requireUserId(), genReq);
    }

    private AiTopicPage requirePage(String code) {
        AiTopicPage page = pageMapper.selectOne(
            new LambdaQueryWrapper<AiTopicPage>()
                .eq(AiTopicPage::getCode, code)
                .eq(AiTopicPage::getStatus, 1));
        if (page == null) {
            throw new BusinessException("专题页不存在");
        }
        return page;
    }

    private String resolvePrompt(String code, AiTopicGenerateRequest request) {
        if (StringUtils.hasText(request.getPrompt())) {
            return request.getPrompt();
        }
        boolean posterPage = "AIhaibao".equalsIgnoreCase(code) || "aihaibao".equalsIgnoreCase(code);
        if (request.getInspirationId() != null) {
            AiTopicInspiration inspiration = inspirationMapper.selectById(request.getInspirationId());
            if (inspiration != null && StringUtils.hasText(inspiration.getPromptText())) {
                return inspiration.getPromptText();
            }
            if (inspiration != null) {
                return posterPage
                    ? "生成" + inspiration.getTitle()
                    : "生成" + inspiration.getTitle() + "风格的带货短视频";
            }
        }
        if (request.getPresetId() != null) {
            AiTopicPreset preset = presetMapper.selectById(request.getPresetId());
            if (preset != null && StringUtils.hasText(preset.getPromptText())) {
                return preset.getPromptText();
            }
            if (preset != null) {
                return posterPage
                    ? "生成" + preset.getTitle() + "风格的 AI 海报"
                    : "生成" + preset.getTitle() + "风格的 AI 视频";
            }
        }
        return null;
    }

    private AiTopicPresetDto toPresetDto(AiTopicPreset preset) {
        AiTopicPresetDto dto = new AiTopicPresetDto();
        dto.setId(preset.getId());
        dto.setTitle(preset.getTitle());
        dto.setCoverUrl(preset.getCoverUrl());
        dto.setPromptText(preset.getPromptText());
        dto.setCardRotateDeg(preset.getCardRotateDeg());
        dto.setCardOffsetX(preset.getCardOffsetX());
        dto.setCardZIndex(preset.getCardZIndex());
        return dto;
    }

    private AiTopicInspirationDto toInspirationDto(AiTopicInspiration item) {
        AiTopicInspirationDto dto = new AiTopicInspirationDto();
        dto.setId(item.getId());
        dto.setTitle(item.getTitle());
        dto.setCoverUrl(item.getCoverUrl());
        dto.setCoverHoverUrl(item.getCoverHoverUrl());
        dto.setPromptText(item.getPromptText());
        return dto;
    }
}
