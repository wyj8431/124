package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.TeamIntroPageDto;
import com.chuangkit.admin.entity.TeamIntroConfig;
import com.chuangkit.admin.entity.TeamIntroFeature;
import com.chuangkit.admin.mapper.TeamIntroConfigMapper;
import com.chuangkit.admin.mapper.TeamIntroFeatureMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamIntroService {

    private final TeamIntroConfigMapper configMapper;
    private final TeamIntroFeatureMapper featureMapper;
    private final ObjectMapper objectMapper;

    public TeamIntroPageDto getPageIndex() {
        TeamIntroConfig config = configMapper.selectById(1L);
        if (config == null) {
            throw new BusinessException("团队介绍页配置不存在");
        }

        TeamIntroPageDto dto = new TeamIntroPageDto();

        TeamIntroPageDto.Hero hero = new TeamIntroPageDto.Hero();
        hero.setTitle(config.getHeroTitle());
        hero.setSubtitle(config.getHeroSubtitle());
        hero.setCtaText(config.getHeroCtaText());
        dto.setHero(hero);
        dto.setTeamNavBadge(config.getTeamNavBadge());

        TeamIntroPageDto.ConsultantWidget consultant = new TeamIntroPageDto.ConsultantWidget();
        consultant.setTitle(config.getConsultantTitle());
        consultant.setSubtitle(config.getConsultantSubtitle());
        consultant.setQrCodeUrl(config.getConsultantQrUrl());
        consultant.setAvatarUrl(config.getConsultantAvatarUrl());
        consultant.setCtaText(config.getConsultantCtaText());
        dto.setConsultant(consultant);

        List<TeamIntroFeature> features = featureMapper.selectList(
            new LambdaQueryWrapper<TeamIntroFeature>()
                .eq(TeamIntroFeature::getStatus, 1)
                .orderByAsc(TeamIntroFeature::getSortOrder));

        for (TeamIntroFeature feature : features) {
            TeamIntroPageDto.FeatureSection section = new TeamIntroPageDto.FeatureSection();
            section.setCode(feature.getCode());
            section.setTitle(feature.getTitle());
            section.setSubtitle(feature.getSubtitle());
            section.setImageUrl(feature.getImageUrl());
            section.setLayout(feature.getLayout());
            section.setCtaText(feature.getCtaText());
            section.setBullets(parseBullets(feature.getBullets()));
            dto.getFeatures().add(section);
        }

        return dto;
    }

    private List<String> parseBullets(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<List<String>>() {});
        } catch (Exception ex) {
            return List.of(raw);
        }
    }
}
