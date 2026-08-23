package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.entity.DesignTemplate;
import com.chuangkit.admin.entity.EditorCollection;
import com.chuangkit.admin.dto.EditorCollectionVo;
import com.chuangkit.admin.mapper.DesignTemplateMapper;
import com.chuangkit.admin.mapper.EditorCollectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EditorCollectionService {

    private final EditorCollectionMapper collectionMapper;
    private final DesignTemplateMapper templateMapper;
    private final JdbcTemplate jdbcTemplate;

    public List<EditorCollectionVo> listWithPreviews() {
        List<EditorCollection> collections = collectionMapper.selectList(
            new LambdaQueryWrapper<EditorCollection>()
                .eq(EditorCollection::getStatus, 1)
                .orderByAsc(EditorCollection::getSortOrder));

        Map<Long, List<String>> previewsByCollection = loadPreviewUrls(
            collections.stream().map(EditorCollection::getId).collect(Collectors.toList()));

        return collections.stream().map(c -> toVo(c, previewsByCollection.get(c.getId()))).collect(Collectors.toList());
    }

    private Map<Long, List<String>> loadPreviewUrls(List<Long> collectionIds) {
        if (collectionIds.isEmpty()) return Map.of();
        String placeholders = collectionIds.stream().map(id -> "?").collect(Collectors.joining(","));
        String sql = """
            SELECT ct.collection_id, dt.cover_url
            FROM collection_template ct
            INNER JOIN design_template dt ON dt.id = ct.template_id AND dt.status = 1
            WHERE ct.collection_id IN (%s)
            ORDER BY ct.collection_id, ct.sort_order
            """.formatted(placeholders);

        Map<Long, List<String>> map = new LinkedHashMap<>();
        jdbcTemplate.query(sql, collectionIds.toArray(), rs -> {
            long cid = rs.getLong("collection_id");
            map.computeIfAbsent(cid, k -> new ArrayList<>()).add(rs.getString("cover_url"));
        });
        return map;
    }

    private EditorCollectionVo toVo(EditorCollection c, List<String> linkedPreviews) {
        EditorCollectionVo vo = new EditorCollectionVo();
        vo.setId(c.getId());
        vo.setTitle(c.getTitle());
        vo.setSubtitle(c.getSubtitle());
        vo.setCoverUrl(c.getCoverUrl());
        vo.setCoverUrlHover(c.getCoverUrlHover());
        vo.setCategoryCode(c.getCategoryCode());
        vo.setTemplateCount(c.getTemplateCount());

        List<String> previews = new ArrayList<>();
        if (linkedPreviews != null) {
            previews.addAll(linkedPreviews.stream().limit(2).toList());
        }
        if (previews.size() < 2 && c.getCoverUrl() != null) {
            previews.add(0, c.getCoverUrl());
        }
        if (previews.size() < 2 && c.getCoverUrlHover() != null) {
            previews.add(c.getCoverUrlHover());
        }
        if (previews.isEmpty()) {
            previews.add("https://picsum.photos/seed/col-" + c.getId() + "a/200/280");
            previews.add("https://picsum.photos/seed/col-" + c.getId() + "b/200/280");
        }
        vo.setPreviewUrls(previews.stream().limit(2).toList());
        return vo;
    }

    public List<DesignTemplate> listTemplates(Long collectionId, int limit) {
        List<Long> templateIds = jdbcTemplate.query(
            "SELECT template_id FROM collection_template WHERE collection_id = ? ORDER BY sort_order LIMIT ?",
            (rs, rowNum) -> rs.getLong("template_id"),
            collectionId, limit);
        if (templateIds.isEmpty()) {
            return List.of();
        }
        return templateMapper.selectList(
            new LambdaQueryWrapper<DesignTemplate>()
                .in(DesignTemplate::getId, templateIds)
                .eq(DesignTemplate::getStatus, 1));
    }
}
