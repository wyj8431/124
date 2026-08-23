package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemplateCenterService {

    private final TemplateCenterNavMapper navMapper;
    private final TemplateFilterGroupMapper filterGroupMapper;
    private final TemplateFilterOptionMapper filterOptionMapper;
    private final TemplateExtraFilterMapper extraFilterMapper;
    private final TemplateExtraFilterOptionMapper extraFilterOptionMapper;
    private final DesignTemplateMapper templateMapper;
    private final DesignSceneMapper sceneMapper;
    private final TemplateCategoryMapper categoryMapper;
    private final CalendarService calendarService;

    /** 模板中心页聚合配置 */
    public Map<String, Object> getIndex() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("navItems", listNavItems());
        data.put("filterGroups", listFilterGroups());
        data.put("extraFilters", listExtraFilters());
        data.put("sortOptions", listSortOptions());
        data.put("tabs", List.of(
            Map.of("code", "design", "name", "设计模板"),
            Map.of("code", "ai", "name", "AI模板")
        ));
        return data;
    }

    /** 按筛选条件查询模板（热点日历模式走 calendarEventId） */
    public Map<String, Object> listTemplates(
            String tab,
            String categoryCode,
            String sceneCode,
            String industryCode,
            String sort,
            String color,
            String usage,
            String style,
            String layout,
            String price,
            String type,
            String keyword,
            Long calendarEventId,
            int limit) {

        int cap = Math.min(Math.max(limit, 1), 120);
        List<DesignTemplate> templates;

        if (calendarEventId != null) {
            String scene = "recommend".equals(sceneCode) ? null : sceneCode;
            templates = calendarService.listTemplatesByEvent(calendarEventId, scene, cap);
            if (StringUtils.hasText(keyword)) {
                String q = keyword.trim().toLowerCase();
                templates = templates.stream()
                    .filter(t -> containsIgnoreCase(t.getTitle(), q) || containsIgnoreCase(t.getTags(), q))
                    .toList();
            }
        } else {
            templates = queryTemplates(
                tab, categoryCode, sceneCode, industryCode, sort,
                color, usage, style, layout, price, type, keyword, cap);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("list", templates);
        result.put("total", templates.size());
        return result;
    }

    private List<DesignTemplate> queryTemplates(
            String tab,
            String categoryCode,
            String sceneCode,
            String industryCode,
            String sort,
            String color,
            String usage,
            String style,
            String layout,
            String price,
            String type,
            String keyword,
            int limit) {

        LambdaQueryWrapper<DesignTemplate> qw = new LambdaQueryWrapper<DesignTemplate>()
            .eq(DesignTemplate::getStatus, 1);

        applyFilterOption(qw, "category", categoryCode);
        applyFilterOption(qw, "scene", sceneCode);
        applyFilterOption(qw, "industry", industryCode);
        applyExtraFilter(qw, "color", color);
        applyExtraFilter(qw, "usage", usage);
        applyExtraFilter(qw, "style", style);
        applyExtraFilter(qw, "layout", layout);
        applyExtraFilter(qw, "price", price);
        applyExtraFilter(qw, "type", type);

        if ("ai".equals(tab)) {
            qw.and(w -> w.like(DesignTemplate::getTags, "AI")
                .or().like(DesignTemplate::getTitle, "AI"));
        }

        if (StringUtils.hasText(keyword)) {
            String q = keyword.trim();
            qw.and(w -> w.like(DesignTemplate::getTitle, q).or().like(DesignTemplate::getTags, q));
        }

        applySort(qw, sort);

        return templateMapper.selectList(qw.last("LIMIT " + limit));
    }

    private void applySort(LambdaQueryWrapper<DesignTemplate> qw, String sort) {
        if ("latest".equals(sort)) {
            qw.orderByDesc(DesignTemplate::getCreateTime);
        } else if ("most_used".equals(sort)) {
            qw.orderByDesc(DesignTemplate::getUseCount);
        } else {
            qw.orderByDesc(DesignTemplate::getIsHot)
                .orderByDesc(DesignTemplate::getUseCount);
        }
    }

    private void applyFilterOption(LambdaQueryWrapper<DesignTemplate> qw, String groupCode, String code) {
        if (!StringUtils.hasText(code) || "all".equals(code) || "recommend".equals(code)) return;
        TemplateFilterOption option = findFilterOption(groupCode, code);
        if (option != null) applyMatch(qw, option);
    }

    private void applyExtraFilter(LambdaQueryWrapper<DesignTemplate> qw, String filterCode, String code) {
        if (!StringUtils.hasText(code) || "all".equals(code)) return;
        TemplateExtraFilterOption option = extraFilterOptionMapper.selectOne(
            new LambdaQueryWrapper<TemplateExtraFilterOption>()
                .eq(TemplateExtraFilterOption::getFilterCode, filterCode)
                .eq(TemplateExtraFilterOption::getCode, code)
                .eq(TemplateExtraFilterOption::getStatus, 1)
                .last("LIMIT 1"));
        if (option != null) applyExtraMatch(qw, option);
    }

    private TemplateFilterOption findFilterOption(String groupCode, String code) {
        return filterOptionMapper.selectOne(
            new LambdaQueryWrapper<TemplateFilterOption>()
                .eq(TemplateFilterOption::getGroupCode, groupCode)
                .eq(TemplateFilterOption::getCode, code)
                .eq(TemplateFilterOption::getStatus, 1)
                .last("LIMIT 1"));
    }

    private void applyMatch(LambdaQueryWrapper<DesignTemplate> qw, TemplateFilterOption option) {
        if (option == null || "all".equals(option.getMatchType())) return;
        switch (option.getMatchType()) {
            case "scene_code" -> {
                DesignScene scene = sceneMapper.selectOne(
                    new LambdaQueryWrapper<DesignScene>()
                        .eq(DesignScene::getCode, option.getMatchValue())
                        .eq(DesignScene::getStatus, 1)
                        .last("LIMIT 1"));
                if (scene != null) qw.eq(DesignTemplate::getSceneId, scene.getId());
            }
            case "scene_id" -> qw.eq(DesignTemplate::getSceneId, Long.parseLong(option.getMatchValue()));
            case "category_code" -> {
                TemplateCategory cat = categoryMapper.selectOne(
                    new LambdaQueryWrapper<TemplateCategory>()
                        .eq(TemplateCategory::getCode, option.getMatchValue())
                        .eq(TemplateCategory::getStatus, 1)
                        .last("LIMIT 1"));
                if (cat != null) qw.eq(DesignTemplate::getCategoryId, cat.getId());
            }
            case "tag" -> qw.and(w -> w.like(DesignTemplate::getTags, option.getMatchValue())
                .or().like(DesignTemplate::getTitle, option.getMatchValue()));
            case "scene_category" -> {
                List<String> categories = Arrays.asList(option.getMatchValue().split(","));
                List<DesignScene> scenes = sceneMapper.selectList(
                    new LambdaQueryWrapper<DesignScene>()
                        .in(DesignScene::getCategory, categories)
                        .eq(DesignScene::getStatus, 1));
                if (!scenes.isEmpty()) {
                    List<Long> sceneIds = scenes.stream().map(DesignScene::getId).toList();
                    qw.in(DesignTemplate::getSceneId, sceneIds);
                }
            }
            default -> { }
        }
    }

    private void applyExtraMatch(LambdaQueryWrapper<DesignTemplate> qw, TemplateExtraFilterOption option) {
        if (option == null || "all".equals(option.getMatchType())) return;
        if ("is_free".equals(option.getMatchType())) {
            qw.eq(DesignTemplate::getIsFree, Integer.parseInt(option.getMatchValue()));
        } else if ("tag".equals(option.getMatchType())) {
            qw.and(w -> w.like(DesignTemplate::getTags, option.getMatchValue())
                .or().like(DesignTemplate::getTitle, option.getMatchValue()));
        }
    }

    private List<Map<String, Object>> listNavItems() {
        LinkedHashMap<String, Map<String, Object>> unique = new LinkedHashMap<>();
        navMapper.selectList(
            new LambdaQueryWrapper<TemplateCenterNav>()
                .eq(TemplateCenterNav::getStatus, 1)
                .orderByAsc(TemplateCenterNav::getSortOrder))
            .forEach(n -> unique.putIfAbsent(n.getCode(), Map.of(
                "id", n.getId(),
                "name", n.getName(),
                "code", n.getCode(),
                "icon", n.getIcon() != null ? n.getIcon() : "",
                "linkType", n.getLinkType(),
                "linkValue", n.getLinkValue() != null ? n.getLinkValue() : ""
            )));
        return new ArrayList<>(unique.values());
    }

    private List<Map<String, Object>> listFilterGroups() {
        List<TemplateFilterGroup> groups = filterGroupMapper.selectList(
            new LambdaQueryWrapper<TemplateFilterGroup>()
                .eq(TemplateFilterGroup::getStatus, 1)
                .orderByAsc(TemplateFilterGroup::getSortOrder));

        List<TemplateFilterOption> allOptions = filterOptionMapper.selectList(
            new LambdaQueryWrapper<TemplateFilterOption>()
                .eq(TemplateFilterOption::getStatus, 1)
                .orderByAsc(TemplateFilterOption::getSortOrder));

        Map<String, List<TemplateFilterOption>> grouped = allOptions.stream()
            .collect(Collectors.groupingBy(
                TemplateFilterOption::getGroupCode,
                LinkedHashMap::new,
                Collectors.collectingAndThen(Collectors.toList(), list -> {
                    LinkedHashMap<String, TemplateFilterOption> unique = new LinkedHashMap<>();
                    for (TemplateFilterOption o : list) unique.putIfAbsent(o.getCode(), o);
                    return new ArrayList<>(unique.values());
                })));

        return groups.stream().map(g -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("code", g.getCode());
            m.put("name", g.getName());
            m.put("options", grouped.getOrDefault(g.getCode(), List.of()).stream().map(o -> {
                Map<String, Object> om = new LinkedHashMap<>();
                om.put("code", o.getCode());
                om.put("name", o.getName());
                return om;
            }).collect(Collectors.toList()));
            return m;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> listExtraFilters() {
        List<TemplateExtraFilter> filters = extraFilterMapper.selectList(
            new LambdaQueryWrapper<TemplateExtraFilter>()
                .eq(TemplateExtraFilter::getStatus, 1)
                .orderByAsc(TemplateExtraFilter::getSortOrder));

        List<TemplateExtraFilterOption> allOptions = extraFilterOptionMapper.selectList(
            new LambdaQueryWrapper<TemplateExtraFilterOption>()
                .eq(TemplateExtraFilterOption::getStatus, 1)
                .orderByAsc(TemplateExtraFilterOption::getSortOrder));

        Map<String, List<TemplateExtraFilterOption>> grouped = allOptions.stream()
            .collect(Collectors.groupingBy(
                TemplateExtraFilterOption::getFilterCode,
                LinkedHashMap::new,
                Collectors.collectingAndThen(Collectors.toList(), list -> {
                    LinkedHashMap<String, TemplateExtraFilterOption> unique = new LinkedHashMap<>();
                    for (TemplateExtraFilterOption o : list) unique.putIfAbsent(o.getCode(), o);
                    return new ArrayList<>(unique.values());
                })));

        return filters.stream().map(f -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("code", f.getCode());
            m.put("name", f.getName());
            m.put("options", grouped.getOrDefault(f.getCode(), List.of()).stream().map(o -> {
                Map<String, Object> om = new LinkedHashMap<>();
                om.put("code", o.getCode());
                om.put("name", o.getName());
                om.put("colorHex", o.getColorHex());
                return om;
            }).collect(Collectors.toList()));
            return m;
        }).collect(Collectors.toList());
    }

    private List<Map<String, String>> listSortOptions() {
        return List.of(
            Map.of("code", "hot", "name", "热门推荐"),
            Map.of("code", "latest", "name", "最新上传"),
            Map.of("code", "most_used", "name", "最多使用")
        );
    }

    private boolean containsIgnoreCase(String text, String q) {
        return text != null && text.toLowerCase().contains(q);
    }
}
