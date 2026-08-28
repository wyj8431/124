package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.DesignShareAccessDto;
import com.chuangkit.admin.dto.DesignShareCreateRequest;
import com.chuangkit.admin.dto.DesignShareLinkDto;
import com.chuangkit.admin.entity.DesignShareLink;
import com.chuangkit.admin.entity.UserDesign;
import com.chuangkit.admin.mapper.DesignShareLinkMapper;
import com.chuangkit.admin.mapper.UserDesignMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

/** 工单编号：网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单 */
@Service
@RequiredArgsConstructor
public class DesignShareService {
    private final DesignShareLinkMapper shareLinkMapper;
    private final UserDesignMapper designMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public DesignShareLinkDto create(Long designId, Long userId, DesignShareCreateRequest request) {
        UserDesign design = ownedDesign(designId, userId);
        String mode = request.getMode().trim().toLowerCase();
        if (!"readonly".equals(mode) && !"editable".equals(mode)) {
            throw new BusinessException("分享模式只支持 readonly 或 editable");
        }
        int days = request.getExpireDays() == null ? 30 : Math.max(1, Math.min(365, request.getExpireDays()));
        DesignShareLink link = new DesignShareLink();
        link.setDesignId(design.getId());
        link.setCreatedBy(userId);
        link.setToken(generateToken());
        link.setMode(mode);
        link.setExpireTime(LocalDateTime.now().plusDays(days));
        link.setRevoked(0);
        shareLinkMapper.insert(link);
        return toDto(link);
    }

    @Transactional
    public void revoke(String token, Long userId) {
        DesignShareLink link = findLink(token);
        if (!userId.equals(link.getCreatedBy())) throw new BusinessException(403, "无权撤销此分享链接");
        link.setRevoked(1);
        shareLinkMapper.updateById(link);
    }

    public DesignShareAccessDto resolve(String token) {
        DesignShareLink link = findLink(token);
        if (!Integer.valueOf(0).equals(link.getRevoked())) throw new BusinessException(404, "分享链接已失效");
        if (link.getExpireTime() != null && link.getExpireTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException(404, "分享链接已过期");
        }
        UserDesign design = designMapper.selectById(link.getDesignId());
        if (design == null || (design.getStatus() != null && !Integer.valueOf(1).equals(design.getStatus()))) throw new BusinessException(404, "设计不存在");
        DesignShareAccessDto dto = new DesignShareAccessDto();
        dto.setDesignId(design.getId());
        dto.setTitle(design.getTitle());
        dto.setCanvasJson(design.getCanvasJson());
        dto.setCoverUrl(design.getCoverUrl());
        dto.setRevision(design.getRevision());
        dto.setWidth(design.getWidth());
        dto.setHeight(design.getHeight());
        dto.setMode(link.getMode());
        dto.setToken(link.getToken());
        return dto;
    }

    private UserDesign ownedDesign(Long designId, Long userId) {
        UserDesign design = designMapper.selectById(designId);
        if (design == null) throw new BusinessException("设计不存在");
        if (!userId.equals(design.getUserId())) throw new BusinessException(403, "只有设计所有者可以创建分享链接");
        return design;
    }

    private DesignShareLink findLink(String token) {
        if (!StringUtils.hasText(token)) throw new BusinessException(404, "分享链接不存在");
        DesignShareLink link = shareLinkMapper.selectOne(new LambdaQueryWrapper<DesignShareLink>()
            .eq(DesignShareLink::getToken, token.trim()).last("LIMIT 1"));
        if (link == null) throw new BusinessException(404, "分享链接不存在");
        return link;
    }

    private DesignShareLinkDto toDto(DesignShareLink link) {
        DesignShareLinkDto dto = new DesignShareLinkDto();
        dto.setId(link.getId()); dto.setDesignId(link.getDesignId()); dto.setToken(link.getToken());
        dto.setMode(link.getMode()); dto.setExpireTime(link.getExpireTime());
        dto.setRevoked(Integer.valueOf(1).equals(link.getRevoked()));
        return dto;
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
