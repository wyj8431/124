package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.dto.EditorCollectionVo;
import com.chuangkit.admin.dto.HomeSectionCardVo;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final SearchTabMapper searchTabMapper;
    private final HomeTabMapper homeTabMapper;
    private final HotTagMapper hotTagMapper;
    private final HomeFeatureMapper homeFeatureMapper;
    private final AiToolMapper aiToolMapper;
    private final DesignSceneMapper sceneMapper;
    private final DesignTemplateMapper templateMapper;
    private final CalendarEventMapper calendarEventMapper;
    private final EditorCollectionService editorCollectionService;
    private final HomeSectionMapper sectionMapper;
    private final HomeSectionCardMapper sectionCardMapper;
    private final TemplateCategoryMapper categoryMapper;
    private final UserDesignMapper userDesignMapper;
    private final UserRecentService userRecentService;

    /** 首页一次性聚合接口 — 前端一次请求拿齐所有数据 */
    public Map<String, Object> getHomeIndex() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("searchTabs", listSearchTabs());
        data.put("homeTabs", listHomeTabs());
        data.put("hotTags", listHotTags());
        data.put("scenes", listScenes());
        data.put("quickStartScenes", listQuickStartScenes());
        data.put("featureCards", listFeatures("hot"));
        data.put("recommendTemplates", listRecommendTemplates(30));
        data.put("calendarEvents", listCalendarEvents());
        data.put("editorCollections", editorCollectionService.listWithPreviews());
        data.put("sections", listSections());
        return data;
    }

    /** 最近设计 — 登录用户返回本人作品，未登录展示演示账号数据 */
    public List<UserDesign> listRecentDesigns(Long userId, int limit) {
        Long targetUserId = userId != null ? userId : 1L;
        return userDesignMapper.selectList(
            new LambdaQueryWrapper<UserDesign>()
                .eq(UserDesign::getUserId, targetUserId)
                .eq(UserDesign::getStatus, 1)
                .orderByDesc(UserDesign::getUpdateTime)
                .last("LIMIT " + limit));
    }

    public List<com.chuangkit.admin.dto.RecentUsageVo> listRecentUsage(Long userId, int limit) {
        return userRecentService.listRecentUsage(userId, limit);
    }

    public List<SearchTab> listSearchTabs() {
        LinkedHashMap<String, SearchTab> unique = new LinkedHashMap<>();
        searchTabMapper.selectList(
            new LambdaQueryWrapper<SearchTab>().eq(SearchTab::getStatus, 1)
                .orderByAsc(SearchTab::getSortOrder))
            .forEach(tab -> unique.putIfAbsent(tab.getCode(), tab));
        return new ArrayList<>(unique.values());
    }

    public List<HomeTab> listHomeTabs() {
        LinkedHashMap<String, HomeTab> unique = new LinkedHashMap<>();
        homeTabMapper.selectList(
            new LambdaQueryWrapper<HomeTab>().eq(HomeTab::getStatus, 1)
                .orderByAsc(HomeTab::getSortOrder))
            .forEach(tab -> unique.putIfAbsent(tab.getCode(), tab));
        return new ArrayList<>(unique.values());
    }

    public List<HotTag> listHotTags() {
        LinkedHashMap<String, HotTag> unique = new LinkedHashMap<>();
        hotTagMapper.selectList(
            new LambdaQueryWrapper<HotTag>().eq(HotTag::getStatus, 1)
                .orderByAsc(HotTag::getSortOrder))
            .forEach(tag -> unique.putIfAbsent(tag.getName(), tag));
        return new ArrayList<>(unique.values());
    }

    /** Tab 功能卡片：优先 home_feature，无数据时回退 ai_tool */
    public List<HomeFeature> listFeatures(String tabCode) {
        List<HomeFeature> features = homeFeatureMapper.selectList(
            new LambdaQueryWrapper<HomeFeature>()
                .eq(HomeFeature::getTabCode, tabCode)
                .eq(HomeFeature::getStatus, 1)
                .orderByAsc(HomeFeature::getSortOrder));
        if (!features.isEmpty()) {
            LinkedHashMap<String, HomeFeature> unique = new LinkedHashMap<>();
            for (HomeFeature feature : features) {
                String key = feature.getTitle() + "|" + feature.getLinkValue();
                unique.putIfAbsent(key, feature);
            }
            return new ArrayList<>(unique.values());
        }
        return listFeaturesFromAiTools(tabCode);
    }

    private List<HomeFeature> listFeaturesFromAiTools(String tabCode) {
        String category = mapTabToAiCategory(tabCode);
        if (category == null) {
            return List.of();
        }
        List<AiTool> tools = aiToolMapper.selectList(
            new LambdaQueryWrapper<AiTool>()
                .eq(AiTool::getCategory, category)
                .eq(AiTool::getStatus, 1)
                .orderByAsc(AiTool::getSortOrder)
                .last("LIMIT 6"));
        return tools.stream().map(this::toHomeFeature).collect(Collectors.toList());
    }

    private String mapTabToAiCategory(String tabCode) {
        return switch (tabCode) {
            case "hot" -> "hot";
            case "ai_ecommerce" -> "ai_ecommerce";
            case "image_process" -> "image_process";
            case "video" -> "hot";
            case "model_wear" -> "ai_ecommerce";
            case "pod" -> "ai_ecommerce";
            default -> null;
        };
    }

    private HomeFeature toHomeFeature(AiTool tool) {
        HomeFeature f = new HomeFeature();
        f.setId(tool.getId());
        f.setTitle(tool.getName());
        f.setSubtitle(tool.getDescription());
        String cover = tool.getCoverUrl() != null ? tool.getCoverUrl() : tool.getIcon();
        f.setCoverUrl(cover);
        f.setLinkType("ai_tool");
        f.setLinkValue(tool.getCode());
        f.setTabCode(tool.getCategory());
        return f;
    }

    public List<DesignScene> listScenes() {
        return sceneMapper.selectList(
            new LambdaQueryWrapper<DesignScene>().eq(DesignScene::getStatus, 1)
                .orderByAsc(DesignScene::getSortOrder));
    }

    /** 快速开始区：创建设计 / 无限画布 / 图片编辑 */
    public List<DesignScene> listQuickStartScenes() {
        List<String> codes = List.of("create", "infinite_canvas", "image_edit");
        List<DesignScene> scenes = sceneMapper.selectList(
            new LambdaQueryWrapper<DesignScene>()
                .in(DesignScene::getCode, codes)
                .eq(DesignScene::getStatus, 1));
        Map<String, DesignScene> byCode = scenes.stream()
            .collect(Collectors.toMap(DesignScene::getCode, s -> s, (a, b) -> a));
        return codes.stream().map(byCode::get).filter(Objects::nonNull).collect(Collectors.toList());
    }

    public List<DesignTemplate> listRecommendTemplates(int limit) {
        LinkedHashMap<String, DesignTemplate> unique = new LinkedHashMap<>();
        templateMapper.selectList(
            new LambdaQueryWrapper<DesignTemplate>()
                .eq(DesignTemplate::getIsRecommend, 1)
                .eq(DesignTemplate::getStatus, 1)
                .orderByDesc(DesignTemplate::getUseCount)
                .last("LIMIT " + limit * 3))
            .forEach(t -> {
                String key = t.getCoverUrl() != null ? t.getCoverUrl() : "id-" + t.getId();
                unique.putIfAbsent(key, t);
            });
        return unique.values().stream().limit(limit).toList();
    }

    public List<Map<String, Object>> listCalendarEvents() {
        List<CalendarEvent> events = calendarEventMapper.selectList(
            new LambdaQueryWrapper<CalendarEvent>().eq(CalendarEvent::getStatus, 1)
                .ge(CalendarEvent::getEventDate, LocalDate.now())
                .orderByAsc(CalendarEvent::getEventDate));
        LinkedHashMap<String, CalendarEvent> unique = new LinkedHashMap<>();
        for (CalendarEvent event : events) {
            unique.putIfAbsent(event.getName() + "|" + event.getEventDate(), event);
        }
        LocalDate today = LocalDate.now();
        return unique.values().stream().limit(6).map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", e.getId());
            m.put("name", e.getName());
            m.put("eventDate", e.getEventDate());
            m.put("weekday", weekdayName(e.getEventDate()));
            m.put("daysLeft", ChronoUnit.DAYS.between(today, e.getEventDate()));
            m.put("coverUrl", e.getCoverUrl());
            return m;
        }).collect(Collectors.toList());
    }

    public List<EditorCollectionVo> listCollections() {
        return editorCollectionService.listWithPreviews();
    }

    public List<Map<String, Object>> listSections() {
        List<HomeSection> sections = sectionMapper.selectList(
            new LambdaQueryWrapper<HomeSection>().eq(HomeSection::getStatus, 1)
                .orderByAsc(HomeSection::getSortOrder));
        return sections.stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("title", s.getTitle());
            m.put("subtitle", s.getSubtitle());
            m.put("code", s.getCode());
            m.put("cards", listSectionCards(s.getCode()));
            m.put("templates", templateMapper.selectList(
                new LambdaQueryWrapper<DesignTemplate>()
                    .eq(DesignTemplate::getCategoryId, s.getCategoryId())
                    .eq(DesignTemplate::getStatus, 1)
                    .orderByDesc(DesignTemplate::getUseCount)
                    .last("LIMIT 6")));
            return m;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getSectionDetail(String code) {
        HomeSection section = sectionMapper.selectOne(
            new LambdaQueryWrapper<HomeSection>()
                .eq(HomeSection::getCode, code)
                .eq(HomeSection::getStatus, 1));
        if (section == null) {
            return Map.of();
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", section.getId());
        m.put("title", section.getTitle());
        m.put("subtitle", section.getSubtitle());
        m.put("code", section.getCode());
        m.put("cards", listSectionCards(code));
        return m;
    }

    public List<HomeSectionCardVo> listSectionCards(String sectionCode) {
        List<HomeSectionCard> cards = sectionCardMapper.selectList(
            new LambdaQueryWrapper<HomeSectionCard>()
                .eq(HomeSectionCard::getSectionCode, sectionCode)
                .eq(HomeSectionCard::getStatus, 1)
                .orderByAsc(HomeSectionCard::getSortOrder));
        if (cards.isEmpty()) {
            return List.of();
        }
        List<Long> templateIds = cards.stream().map(HomeSectionCard::getTemplateId).collect(Collectors.toList());
        Map<Long, DesignTemplate> templateMap = templateMapper.selectList(
            new LambdaQueryWrapper<DesignTemplate>().in(DesignTemplate::getId, templateIds))
            .stream().collect(Collectors.toMap(DesignTemplate::getId, t -> t, (a, b) -> a));

        return cards.stream().map(card -> {
            HomeSectionCardVo vo = new HomeSectionCardVo();
            vo.setId(card.getId());
            vo.setLabel(card.getLabel());
            vo.setTemplateId(card.getTemplateId());
            DesignTemplate t = templateMap.get(card.getTemplateId());
            if (t != null) {
                vo.setTitle(t.getTitle());
                vo.setCoverUrl(t.getCoverUrl());
                vo.setWidth(t.getWidth());
                vo.setHeight(t.getHeight());
                vo.setIsFree(t.getIsFree());
            }
            return vo;
        }).collect(Collectors.toList());
    }

    private String weekdayName(LocalDate date) {
        return switch (date.getDayOfWeek().getValue()) {
            case 1 -> "星期一"; case 2 -> "星期二"; case 3 -> "星期三";
            case 4 -> "星期四"; case 5 -> "星期五"; case 6 -> "星期六"; default -> "星期日";
        };
    }
}
