package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.dto.RecentUsageVo;
import com.chuangkit.admin.entity.DesignScene;
import com.chuangkit.admin.entity.DesignTemplate;
import com.chuangkit.admin.entity.UserRecent;
import com.chuangkit.admin.mapper.DesignSceneMapper;
import com.chuangkit.admin.mapper.DesignTemplateMapper;
import com.chuangkit.admin.mapper.UserRecentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserRecentService {

    private final UserRecentMapper userRecentMapper;
    private final DesignSceneMapper sceneMapper;
    private final DesignTemplateMapper templateMapper;

    public void record(Long userId, String targetType, Long targetId) {
        if (userId == null || targetType == null || targetId == null) {
            return;
        }
        UserRecent existing = userRecentMapper.selectOne(
            new LambdaQueryWrapper<UserRecent>()
                .eq(UserRecent::getUserId, userId)
                .eq(UserRecent::getTargetType, targetType)
                .eq(UserRecent::getTargetId, targetId));
        if (existing != null) {
            userRecentMapper.deleteById(existing.getId());
        }
        UserRecent recent = new UserRecent();
        recent.setUserId(userId);
        recent.setTargetType(targetType);
        recent.setTargetId(targetId);
        userRecentMapper.insert(recent);
    }

    /** 侧边栏「最近使用」— 登录用户返回本人记录，未登录展示演示账号数据 */
    public List<RecentUsageVo> listRecentUsage(Long userId, int limit) {
        Long targetUserId = userId != null ? userId : 1L;
        List<UserRecent> records = userRecentMapper.selectList(
            new LambdaQueryWrapper<UserRecent>()
                .eq(UserRecent::getUserId, targetUserId)
                .orderByDesc(UserRecent::getCreateTime)
                .last("LIMIT " + limit));
        if (records.isEmpty()) {
            return List.of();
        }

        List<Long> sceneIds = records.stream()
            .filter(r -> "scene".equals(r.getTargetType()))
            .map(UserRecent::getTargetId)
            .distinct()
            .collect(Collectors.toList());
        List<Long> templateIds = records.stream()
            .filter(r -> "template".equals(r.getTargetType()))
            .map(UserRecent::getTargetId)
            .distinct()
            .collect(Collectors.toList());

        Map<Long, DesignScene> sceneMap = sceneIds.isEmpty() ? Map.of()
            : sceneMapper.selectList(new LambdaQueryWrapper<DesignScene>().in(DesignScene::getId, sceneIds))
                .stream().collect(Collectors.toMap(DesignScene::getId, s -> s, (a, b) -> a));
        Map<Long, DesignTemplate> templateMap = templateIds.isEmpty() ? Map.of()
            : templateMapper.selectList(new LambdaQueryWrapper<DesignTemplate>().in(DesignTemplate::getId, templateIds))
                .stream().collect(Collectors.toMap(DesignTemplate::getId, t -> t, (a, b) -> a));

        List<RecentUsageVo> result = new ArrayList<>();
        for (UserRecent record : records) {
            RecentUsageVo vo = new RecentUsageVo();
            vo.setId(record.getId());
            vo.setTargetType(record.getTargetType());
            vo.setTargetId(record.getTargetId());
            if ("scene".equals(record.getTargetType())) {
                DesignScene scene = sceneMap.get(record.getTargetId());
                if (scene == null) continue;
                vo.setName(scene.getName());
                vo.setIcon(scene.getIcon());
                vo.setCoverUrl(scene.getPreviewUrl());
                vo.setWidth(scene.getWidth());
                vo.setHeight(scene.getHeight());
            } else if ("template".equals(record.getTargetType())) {
                DesignTemplate template = templateMap.get(record.getTargetId());
                if (template == null) continue;
                vo.setName(template.getTitle());
                vo.setCoverUrl(template.getCoverUrl());
                vo.setWidth(template.getWidth());
                vo.setHeight(template.getHeight());
            } else {
                continue;
            }
            result.add(vo);
        }
        return result;
    }
}
