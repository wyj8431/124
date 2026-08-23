package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.MessageCenterIndexDto;
import com.chuangkit.admin.dto.MessageCenterListDto;
import com.chuangkit.admin.dto.MessageCenterMessageVo;
import com.chuangkit.admin.entity.UserMessage;
import com.chuangkit.admin.mapper.UserMessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MessageCenterService {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final Map<String, String> CATEGORY_LABELS = Map.of(
        "system", "系统通知",
        "activity", "活动消息",
        "order", "订单消息"
    );

    private final UserMessageMapper messageMapper;

    public MessageCenterIndexDto getIndex(Long userId) {
        MessageCenterIndexDto dto = new MessageCenterIndexDto();
        dto.setPageTitle("消息中心");
        dto.setEmptyText("暂时没有消息");
        dto.setUnreadCount(countUnread(userId, null));
        dto.setCategories(buildCategoryTabs(userId));
        return dto;
    }

    public MessageCenterListDto listMessages(Long userId, String category, int page, int pageSize) {
        LambdaQueryWrapper<UserMessage> qw = baseFilter(userId);
        if (StringUtils.hasText(category) && !"all".equals(category)) {
            qw.eq(UserMessage::getCategory, category.trim());
        }
        qw.orderByDesc(UserMessage::getCreateTime);

        Page<UserMessage> p = messageMapper.selectPage(new Page<>(page, pageSize), qw);
        MessageCenterListDto dto = new MessageCenterListDto();
        dto.setList(p.getRecords().stream().map(this::toListVo).toList());
        dto.setTotal(p.getTotal());
        dto.setPage(p.getCurrent());
        dto.setPageSize(p.getSize());
        dto.setTotalPages(p.getPages());
        dto.setUnreadCount(countUnread(userId, category));
        return dto;
    }

    public MessageCenterMessageVo getMessage(Long userId, Long messageId) {
        UserMessage message = requireMessage(userId, messageId);
        return toDetailVo(message);
    }

    @Transactional
    public MessageCenterMessageVo markRead(Long userId, Long messageId) {
        UserMessage message = requireMessage(userId, messageId);
        if (message.getIsRead() == null || message.getIsRead() == 0) {
            message.setIsRead(1);
            message.setReadTime(LocalDateTime.now());
            messageMapper.updateById(message);
        }
        return toDetailVo(message);
    }

    @Transactional
    public int markAllRead(Long userId, String category) {
        LambdaUpdateWrapper<UserMessage> uw = new LambdaUpdateWrapper<UserMessage>()
            .eq(UserMessage::getUserId, userId)
            .eq(UserMessage::getStatus, 1)
            .eq(UserMessage::getIsRead, 0)
            .set(UserMessage::getIsRead, 1)
            .set(UserMessage::getReadTime, LocalDateTime.now());
        if (StringUtils.hasText(category) && !"all".equals(category)) {
            uw.eq(UserMessage::getCategory, category.trim());
        }
        return messageMapper.update(null, uw);
    }

    private List<MessageCenterIndexDto.CategoryTab> buildCategoryTabs(Long userId) {
        return List.of(
            tab("all", "全部", countUnread(userId, null)),
            tab("system", "系统通知", countUnread(userId, "system")),
            tab("activity", "活动消息", countUnread(userId, "activity")),
            tab("order", "订单消息", countUnread(userId, "order"))
        );
    }

    private MessageCenterIndexDto.CategoryTab tab(String code, String name, int unread) {
        MessageCenterIndexDto.CategoryTab tab = new MessageCenterIndexDto.CategoryTab();
        tab.setCode(code);
        tab.setName(name);
        tab.setUnreadCount(unread);
        return tab;
    }

    private int countUnread(Long userId, String category) {
        LambdaQueryWrapper<UserMessage> qw = baseFilter(userId).eq(UserMessage::getIsRead, 0);
        if (StringUtils.hasText(category) && !"all".equals(category)) {
            qw.eq(UserMessage::getCategory, category.trim());
        }
        Long count = messageMapper.selectCount(qw);
        return count != null ? count.intValue() : 0;
    }

    private LambdaQueryWrapper<UserMessage> baseFilter(Long userId) {
        return new LambdaQueryWrapper<UserMessage>()
            .eq(UserMessage::getUserId, userId)
            .eq(UserMessage::getStatus, 1);
    }

    private UserMessage requireMessage(Long userId, Long messageId) {
        UserMessage message = messageMapper.selectOne(
            baseFilter(userId).eq(UserMessage::getId, messageId));
        if (message == null) {
            throw new BusinessException("消息不存在");
        }
        return message;
    }

    private MessageCenterMessageVo toListVo(UserMessage message) {
        MessageCenterMessageVo vo = new MessageCenterMessageVo();
        vo.setId(message.getId());
        vo.setCategory(message.getCategory());
        vo.setCategoryLabel(resolveCategoryLabel(message.getCategory()));
        vo.setTitle(message.getTitle());
        vo.setSummary(message.getSummary());
        vo.setRead(message.getIsRead() != null && message.getIsRead() == 1);
        vo.setCreateTime(formatDateTime(message.getCreateTime()));
        return vo;
    }

    private MessageCenterMessageVo toDetailVo(UserMessage message) {
        MessageCenterMessageVo vo = toListVo(message);
        vo.setContent(message.getContent());
        vo.setLinkUrl(message.getLinkUrl());
        vo.setLinkText(message.getLinkText());
        return vo;
    }

    private String resolveCategoryLabel(String category) {
        if (!StringUtils.hasText(category)) {
            return "系统通知";
        }
        return CATEGORY_LABELS.getOrDefault(category, "系统通知");
    }

    private String formatDateTime(LocalDateTime time) {
        return time == null ? "" : time.format(DATE_TIME);
    }
}
