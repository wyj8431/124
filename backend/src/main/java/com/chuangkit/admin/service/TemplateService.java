package com.chuangkit.admin.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;

import com.chuangkit.admin.common.PageResult;

import com.chuangkit.admin.dto.AiGenerateRequest;

import com.chuangkit.admin.dto.RecommendTemplateVo;

import com.chuangkit.admin.entity.DesignTemplate;

import com.chuangkit.admin.entity.TemplateLike;

import com.chuangkit.admin.mapper.DesignTemplateMapper;

import com.chuangkit.admin.mapper.TemplateLikeMapper;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.BeanUtils;

import org.springframework.stereotype.Service;

import org.springframework.util.StringUtils;



import java.util.List;

import java.util.Map;

import java.util.Set;

import java.util.stream.Collectors;



@Service

@RequiredArgsConstructor

public class TemplateService {



    private final DesignTemplateMapper templateMapper;

    private final TemplateLikeMapper templateLikeMapper;

    private final UserRecentService userRecentService;

    private final AiGenerateService aiGenerateService;



    public PageResult<DesignTemplate> list(int page, int pageSize, Long categoryId, Long sceneId) {

        LambdaQueryWrapper<DesignTemplate> qw = new LambdaQueryWrapper<DesignTemplate>()

            .eq(DesignTemplate::getStatus, 1)

            .orderByDesc(DesignTemplate::getUseCount);

        if (categoryId != null) qw.eq(DesignTemplate::getCategoryId, categoryId);

        if (sceneId != null) qw.eq(DesignTemplate::getSceneId, sceneId);

        Page<DesignTemplate> p = templateMapper.selectPage(new Page<>(page, pageSize), qw);

        return PageResult.of(p);

    }



    public List<RecommendTemplateVo> listRecommend(Long userId, int limit) {

        List<DesignTemplate> templates = templateMapper.selectList(

            new LambdaQueryWrapper<DesignTemplate>()

                .eq(DesignTemplate::getIsRecommend, 1)

                .eq(DesignTemplate::getStatus, 1)

                .orderByDesc(DesignTemplate::getUseCount)

                .last("LIMIT " + limit));

        Set<Long> likedIds = loadLikedTemplateIds(userId, templates);

        Map<Long, Long> likeCounts = loadLikeCounts(templates);

        return templates.stream().map(t -> {

            RecommendTemplateVo vo = toVo(t);

            vo.setLiked(userId != null && likedIds.contains(t.getId()));

            vo.setLikeCount(likeCounts.getOrDefault(t.getId(), 0L).intValue());

            return vo;

        }).collect(Collectors.toList());

    }



    public PageResult<DesignTemplate> search(String keyword, int page, int pageSize) {

        LambdaQueryWrapper<DesignTemplate> qw = new LambdaQueryWrapper<DesignTemplate>()

            .eq(DesignTemplate::getStatus, 1)

            .orderByDesc(DesignTemplate::getUseCount);

        if (StringUtils.hasText(keyword)) {

            qw.and(w -> w.like(DesignTemplate::getTitle, keyword)

                .or().like(DesignTemplate::getTags, keyword));

        }

        return PageResult.of(templateMapper.selectPage(new Page<>(page, pageSize), qw));

    }



    public DesignTemplate getById(Long id) {

        DesignTemplate t = templateMapper.selectById(id);

        if (t == null) throw new BusinessException("模板不存在");

        return t;

    }



    public void incrementUseCount(Long id) {

        DesignTemplate t = getById(id);

        t.setUseCount(t.getUseCount() + 1);

        templateMapper.updateById(t);

    }



    public Map<String, Object> toggleLike(Long userId, Long templateId) {

        getById(templateId);

        TemplateLike existing = templateLikeMapper.selectOne(

            new LambdaQueryWrapper<TemplateLike>()

                .eq(TemplateLike::getUserId, userId)

                .eq(TemplateLike::getTemplateId, templateId));

        boolean liked;

        if (existing != null) {

            templateLikeMapper.deleteById(existing.getId());

            liked = false;

        } else {

            TemplateLike like = new TemplateLike();

            like.setUserId(userId);

            like.setTemplateId(templateId);

            templateLikeMapper.insert(like);

            liked = true;

        }

        long count = templateLikeMapper.selectCount(

            new LambdaQueryWrapper<TemplateLike>().eq(TemplateLike::getTemplateId, templateId));

        return Map.of("liked", liked, "likeCount", count);

    }



    public Map<String, Object> referenceGenerate(Long userId, Long templateId) {

        DesignTemplate template = getById(templateId);

        incrementUseCount(templateId);

        recordRecent(userId, templateId);



        AiGenerateRequest req = new AiGenerateRequest();

        req.setMode("image_gen");

        req.setPrompt("参考模板「" + template.getTitle() + "」的风格与构图，生成类似设计");

        req.setModel("omni_image_2");

        req.setAspectRatio(resolveAspectRatio(template));

        req.setStyle("general");

        if (template.getCoverUrl() != null) {

            req.setReferenceUrls(List.of(template.getCoverUrl()));

        }



        Map<String, Object> result = aiGenerateService.generate(userId, req);

        result.put("templateId", templateId);

        result.put("templateTitle", template.getTitle());

        return result;

    }



    public void recordView(Long userId, Long templateId) {

        getById(templateId);

        if (userId != null) {

            recordRecent(userId, templateId);

        }

    }



    private void recordRecent(Long userId, Long templateId) {
        userRecentService.record(userId, "template", templateId);
    }



    private Set<Long> loadLikedTemplateIds(Long userId, List<DesignTemplate> templates) {

        if (userId == null || templates.isEmpty()) return Set.of();

        List<Long> ids = templates.stream().map(DesignTemplate::getId).collect(Collectors.toList());

        return templateLikeMapper.selectList(

            new LambdaQueryWrapper<TemplateLike>()

                .eq(TemplateLike::getUserId, userId)

                .in(TemplateLike::getTemplateId, ids))

            .stream().map(TemplateLike::getTemplateId).collect(Collectors.toSet());

    }



    private Map<Long, Long> loadLikeCounts(List<DesignTemplate> templates) {

        if (templates.isEmpty()) return Map.of();

        List<Long> ids = templates.stream().map(DesignTemplate::getId).collect(Collectors.toList());

        return templateLikeMapper.selectList(

            new LambdaQueryWrapper<TemplateLike>().in(TemplateLike::getTemplateId, ids))

            .stream()

            .collect(Collectors.groupingBy(TemplateLike::getTemplateId, Collectors.counting()));

    }



    private RecommendTemplateVo toVo(DesignTemplate t) {

        RecommendTemplateVo vo = new RecommendTemplateVo();

        BeanUtils.copyProperties(t, vo);

        return vo;

    }



    private String resolveAspectRatio(DesignTemplate template) {

        if (template.getWidth() == null || template.getHeight() == null) return "1:1";

        double ratio = (double) template.getWidth() / template.getHeight();

        if (ratio > 1.4) return "16:9";

        if (ratio > 1.1) return "4:3";

        if (ratio < 0.7) return "9:16";

        if (ratio < 0.9) return "3:4";

        return "1:1";

    }

}

