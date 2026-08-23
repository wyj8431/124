package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.chuangkit.admin.common.PageResult;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreateDesignService {

    private final CreateDesignNavMapper navMapper;
    private final CreateDesignSizeTabMapper sizeTabMapper;
    private final CreateDesignSceneRelMapper sceneRelMapper;
    private final DesignSceneMapper sceneMapper;
    private final DesignTemplateMapper templateMapper;

    /** 弹窗初始化：左侧导航 + 尺寸 Tab */
    public Map<String, Object> getIndex() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("navItems", listNavItems());
        data.put("sizeTabs", listSizeTabs());
        data.put("defaultNavCode", "recommend");
        data.put("defaultSizeTabCode", "common");
        return data;
    }

    public List<CreateDesignNav> listNavItems() {
        return navMapper.selectList(
            new LambdaQueryWrapper<CreateDesignNav>()
                .eq(CreateDesignNav::getStatus, 1)
                .orderByAsc(CreateDesignNav::getSortOrder));
    }

    public List<CreateDesignSizeTab> listSizeTabs() {
        return sizeTabMapper.selectList(
            new LambdaQueryWrapper<CreateDesignSizeTab>()
                .eq(CreateDesignSizeTab::getStatus, 1)
                .orderByAsc(CreateDesignSizeTab::getSortOrder));
    }

    /** 预设尺寸卡片 — 随导航与 Tab 切换 */
    public List<DesignScene> listPresetScenes(String navCode, String sizeTabCode, String keyword) {
        String nav = StringUtils.hasText(navCode) ? navCode : "recommend";
        String tab = StringUtils.hasText(sizeTabCode) ? sizeTabCode : "common";

        List<CreateDesignSceneRel> rels = sceneRelMapper.selectList(
            new LambdaQueryWrapper<CreateDesignSceneRel>()
                .eq(CreateDesignSceneRel::getNavCode, nav)
                .eq(CreateDesignSceneRel::getSizeTabCode, tab)
                .eq(CreateDesignSceneRel::getStatus, 1)
                .orderByAsc(CreateDesignSceneRel::getSortOrder));

        List<Long> sceneIds = rels.stream().map(CreateDesignSceneRel::getSceneId).toList();
        if (sceneIds.isEmpty()) {
            return listScenesByNavMatch(nav, keyword);
        }

        Map<Long, DesignScene> sceneMap = sceneMapper.selectList(
            new LambdaQueryWrapper<DesignScene>()
                .in(DesignScene::getId, sceneIds)
                .eq(DesignScene::getStatus, 1))
            .stream().collect(Collectors.toMap(DesignScene::getId, s -> s, (a, b) -> a));

        List<DesignScene> scenes = sceneIds.stream()
            .map(sceneMap::get)
            .filter(Objects::nonNull)
            .filter(s -> matchesKeyword(s, keyword))
            .toList();

        if (scenes.isEmpty()) {
            return listScenesByNavMatch(nav, keyword);
        }
        return scenes;
    }

    /** 模板推荐瀑布流 */
    public PageResult<DesignTemplate> listRecommendTemplates(
            String navCode, String sizeTabCode, Long sceneId, String keyword, int page, int pageSize) {
        LambdaQueryWrapper<DesignTemplate> wrapper = new LambdaQueryWrapper<DesignTemplate>()
            .eq(DesignTemplate::getStatus, 1)
            .orderByDesc(DesignTemplate::getIsRecommend)
            .orderByDesc(DesignTemplate::getUseCount);

        if (sceneId != null) {
            wrapper.eq(DesignTemplate::getSceneId, sceneId);
        } else {
            List<Long> sceneIds = resolveSceneIdsForFilter(navCode, sizeTabCode);
            if (!sceneIds.isEmpty()) {
                wrapper.in(DesignTemplate::getSceneId, sceneIds);
            } else {
                applyNavMatchToTemplate(wrapper, navCode);
            }
        }

        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(DesignTemplate::getTitle, keyword)
                .or().like(DesignTemplate::getTags, keyword));
        }

        Page<DesignTemplate> p = templateMapper.selectPage(new Page<>(page, pageSize), wrapper);
        return PageResult.of(p);
    }

    private List<DesignScene> listScenesByNavMatch(String navCode, String keyword) {
        CreateDesignNav nav = navMapper.selectOne(
            new LambdaQueryWrapper<CreateDesignNav>()
                .eq(CreateDesignNav::getCode, navCode)
                .eq(CreateDesignNav::getStatus, 1));
        if (nav == null) {
            return List.of();
        }
        LambdaQueryWrapper<DesignScene> wrapper = new LambdaQueryWrapper<DesignScene>()
            .eq(DesignScene::getStatus, 1)
            .orderByAsc(DesignScene::getSortOrder);
        applyNavMatchToScene(wrapper, nav);
        return sceneMapper.selectList(wrapper).stream()
            .filter(s -> matchesKeyword(s, keyword))
            .limit(12)
            .toList();
    }

    private List<Long> resolveSceneIdsForFilter(String navCode, String sizeTabCode) {
        String nav = StringUtils.hasText(navCode) ? navCode : "recommend";
        String tab = StringUtils.hasText(sizeTabCode) ? sizeTabCode : "common";
        List<CreateDesignSceneRel> rels = sceneRelMapper.selectList(
            new LambdaQueryWrapper<CreateDesignSceneRel>()
                .eq(CreateDesignSceneRel::getNavCode, nav)
                .eq(CreateDesignSceneRel::getSizeTabCode, tab)
                .eq(CreateDesignSceneRel::getStatus, 1));
        if (!rels.isEmpty()) {
            return rels.stream().map(CreateDesignSceneRel::getSceneId).distinct().toList();
        }
        return listScenesByNavMatch(nav, null).stream().map(DesignScene::getId).toList();
    }

    private void applyNavMatchToScene(LambdaQueryWrapper<DesignScene> wrapper, CreateDesignNav nav) {
        if (nav == null || !StringUtils.hasText(nav.getMatchType()) || "all".equals(nav.getMatchType())) {
            return;
        }
        switch (nav.getMatchType()) {
            case "scene_category" -> {
                List<String> categories = Arrays.asList(nav.getMatchValue().split(","));
                wrapper.in(DesignScene::getCategory, categories);
            }
            case "scene_code" -> wrapper.eq(DesignScene::getCode, nav.getMatchValue());
            default -> { }
        }
    }

    private void applyNavMatchToTemplate(LambdaQueryWrapper<DesignTemplate> wrapper, String navCode) {
        CreateDesignNav nav = navMapper.selectOne(
            new LambdaQueryWrapper<CreateDesignNav>()
                .eq(CreateDesignNav::getCode, navCode)
                .eq(CreateDesignNav::getStatus, 1));
        if (nav == null || !StringUtils.hasText(nav.getMatchType())) {
            return;
        }
        switch (nav.getMatchType()) {
            case "scene_category" -> {
                List<String> categories = Arrays.asList(nav.getMatchValue().split(","));
                List<DesignScene> scenes = sceneMapper.selectList(
                    new LambdaQueryWrapper<DesignScene>()
                        .in(DesignScene::getCategory, categories)
                        .eq(DesignScene::getStatus, 1));
                List<Long> ids = scenes.stream().map(DesignScene::getId).toList();
                if (!ids.isEmpty()) wrapper.in(DesignTemplate::getSceneId, ids);
            }
            case "scene_code" -> {
                DesignScene scene = sceneMapper.selectOne(
                    new LambdaQueryWrapper<DesignScene>()
                        .eq(DesignScene::getCode, nav.getMatchValue())
                        .eq(DesignScene::getStatus, 1));
                if (scene != null) wrapper.eq(DesignTemplate::getSceneId, scene.getId());
            }
            case "tag" -> wrapper.like(DesignTemplate::getTags, nav.getMatchValue());
            default -> { }
        }
    }

    private boolean matchesKeyword(DesignScene scene, String keyword) {
        if (!StringUtils.hasText(keyword)) return true;
        String kw = keyword.toLowerCase();
        return scene.getName().toLowerCase().contains(kw)
            || (scene.getCode() != null && scene.getCode().toLowerCase().contains(kw));
    }
}
