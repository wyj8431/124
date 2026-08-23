package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.entity.CalendarCategory;
import com.chuangkit.admin.entity.CalendarEvent;
import com.chuangkit.admin.entity.DesignTemplate;
import com.chuangkit.admin.mapper.CalendarCategoryMapper;
import com.chuangkit.admin.mapper.CalendarEventMapper;
import com.chuangkit.admin.mapper.DesignTemplateMapper;
import com.chuangkit.admin.entity.DesignScene;
import com.chuangkit.admin.mapper.DesignSceneMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarCategoryMapper categoryMapper;
    private final CalendarEventMapper eventMapper;
    private final DesignTemplateMapper templateMapper;
    private final DesignSceneMapper sceneMapper;

    /** 热点日历页聚合数据 */
    public Map<String, Object> getCalendarIndex() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("categories", listCategories());
        data.put("today", buildToday());
        data.put("events", listUpcomingEvents(null));
        return data;
    }

    public List<CalendarCategory> listCategories() {
        return categoryMapper.selectList(
            new LambdaQueryWrapper<CalendarCategory>()
                .eq(CalendarCategory::getStatus, 1)
                .orderByAsc(CalendarCategory::getSortOrder));
    }

    public List<Map<String, Object>> listUpcomingEvents(List<String> categoryCodes) {
        LambdaQueryWrapper<CalendarEvent> qw = new LambdaQueryWrapper<CalendarEvent>()
            .eq(CalendarEvent::getStatus, 1)
            .ge(CalendarEvent::getEventDate, LocalDate.now())
            .orderByAsc(CalendarEvent::getEventDate)
            .orderByAsc(CalendarEvent::getSortOrder);
        if (categoryCodes != null && !categoryCodes.isEmpty()) {
            qw.in(CalendarEvent::getCategoryCode, categoryCodes);
        }
        LocalDate today = LocalDate.now();
        return eventMapper.selectList(qw).stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", e.getId());
            m.put("name", e.getName());
            m.put("eventDate", e.getEventDate());
            m.put("dateLabel", formatEventDate(e.getEventDate()));
            m.put("weekday", weekdayName(e.getEventDate()));
            m.put("daysLeft", ChronoUnit.DAYS.between(today, e.getEventDate()));
            m.put("categoryCode", e.getCategoryCode());
            m.put("description", e.getDescription());
            return m;
        }).collect(Collectors.toList());
    }

    public List<DesignTemplate> listTemplatesByEvent(Long eventId, String sceneCode, int limit) {
        CalendarEvent event = eventMapper.selectById(eventId);
        if (event == null) return List.of();
        int cap = Math.min(Math.max(limit, 1), 120);
        List<DesignTemplate> rows = templateMapper.selectByCalendarEvent(eventId, cap * 2);
        if (rows.isEmpty()) {
            rows = listTemplatesByEventKeywords(event, cap * 2);
        }
        if (sceneCode != null && !sceneCode.isBlank() && !"recommend".equals(sceneCode)) {
            rows = filterByScene(rows, sceneCode);
        }
        return dedupeTemplates(rows).stream().limit(cap).toList();
    }

    private List<DesignTemplate> listTemplatesByEventKeywords(CalendarEvent event, int limit) {
        List<String> keywords = resolveEventKeywords(event);
        LambdaQueryWrapper<DesignTemplate> qw = new LambdaQueryWrapper<DesignTemplate>()
            .eq(DesignTemplate::getStatus, 1)
            .and(w -> {
                for (int i = 0; i < keywords.size(); i++) {
                    String kw = keywords.get(i);
                    if (i == 0) {
                        w.like(DesignTemplate::getTags, kw).or().like(DesignTemplate::getTitle, kw);
                    } else {
                        w.or().like(DesignTemplate::getTags, kw).or().like(DesignTemplate::getTitle, kw);
                    }
                }
            });
        return templateMapper.selectList(
            qw.orderByDesc(DesignTemplate::getUseCount).last("LIMIT " + limit));
    }

    private List<DesignTemplate> filterByScene(List<DesignTemplate> rows, String sceneCode) {
        DesignScene scene = sceneMapper.selectOne(
            new LambdaQueryWrapper<DesignScene>()
                .eq(DesignScene::getCode, sceneCode)
                .eq(DesignScene::getStatus, 1)
                .last("LIMIT 1"));
        if (scene != null) {
            return rows.stream().filter(t -> scene.getId().equals(t.getSceneId())).toList();
        }
        return rows.stream().filter(t -> matchesSceneCode(t, sceneCode)).toList();
    }

    private boolean matchesSceneCode(DesignTemplate t, String sceneCode) {
        if (t.getWidth() == null || t.getHeight() == null || t.getHeight() == 0) return false;
        double r = t.getWidth() / (double) t.getHeight();
        return switch (sceneCode) {
            case "vertical_poster" -> t.getHeight() > t.getWidth() && r <= 0.85;
            case "long_poster" -> t.getHeight() / (double) t.getWidth() >= 2;
            case "horizontal_poster" -> t.getWidth() > t.getHeight();
            case "square_poster" -> Math.abs(t.getWidth() - t.getHeight()) <= t.getWidth() * 0.15;
            case "wechat_sub" -> r >= 1.4 && r < 2.2 && t.getHeight() < 600;
            case "moments_cover" -> Math.abs(t.getWidth() - t.getHeight()) <= t.getWidth() * 0.1 && t.getWidth() >= 1000;
            default -> true;
        };
    }

    private List<String> resolveEventKeywords(CalendarEvent event) {
        LinkedHashSet<String> keywords = new LinkedHashSet<>();
        keywords.add(event.getName());
        switch (event.getName()) {
            case "中国医师节" -> {
                keywords.add("医师节");
                keywords.add("医师");
                keywords.add("医生");
            }
            case "处暑" -> keywords.add("节气");
            case "中元节" -> keywords.add("中元");
            case "九月你好" -> {
                keywords.add("九月");
                keywords.add("问候");
            }
            case "开学季" -> {
                keywords.add("开学");
                keywords.add("校园");
                keywords.add("教育");
            }
            case "教师节" -> {
                keywords.add("教师");
                keywords.add("感恩");
            }
            case "中秋节" -> {
                keywords.add("中秋");
                keywords.add("团圆");
            }
            case "国庆节" -> {
                keywords.add("国庆");
                keywords.add("祖国");
            }
            case "双十一" -> {
                keywords.add("双十一");
                keywords.add("电商");
                keywords.add("大促");
            }
            case "圣诞节" -> {
                keywords.add("圣诞");
                keywords.add("平安夜");
            }
            default -> { }
        }
        return new ArrayList<>(keywords);
    }

    private List<DesignTemplate> dedupeTemplates(List<DesignTemplate> rows) {
        LinkedHashMap<String, DesignTemplate> unique = new LinkedHashMap<>();
        for (DesignTemplate row : rows) {
            String key = row.getCoverUrl() != null && !row.getCoverUrl().isBlank()
                ? row.getCoverUrl()
                : "id-" + row.getId();
            unique.putIfAbsent(key, row);
        }
        return new ArrayList<>(unique.values());
    }

    private Map<String, Object> buildToday() {
        LocalDate today = LocalDate.now();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("day", today.getDayOfMonth());
        m.put("yearMonth", String.format("%d.%02d", today.getYear(), today.getMonthValue()));
        m.put("weekday", weekdayName(today));
        m.put("lunarDate", lunarDateLabel(today));
        return m;
    }

    private String formatEventDate(LocalDate date) {
        return String.format("%d.%02d.%02d", date.getYear(), date.getMonthValue(), date.getDayOfMonth());
    }

    private String weekdayName(LocalDate date) {
        return switch (date.getDayOfWeek().getValue()) {
            case 1 -> "星期一"; case 2 -> "星期二"; case 3 -> "星期三";
            case 4 -> "星期四"; case 5 -> "星期五"; case 6 -> "星期六"; default -> "星期日";
        };
    }

    /** 演示用农历文案，可按日期映射 */
    private String lunarDateLabel(LocalDate date) {
        if (date.equals(LocalDate.of(2026, 8, 17))) return "七月初五";
        if (date.getMonthValue() == 8 && date.getDayOfMonth() >= 15) return "七月";
        if (date.getMonthValue() == 9) return "八月";
        return "农历";
    }
}
