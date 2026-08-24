package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.SupportTicketCreateRequest;
import com.chuangkit.admin.dto.SupportTicketUpdateRequest;
import com.chuangkit.admin.entity.SupportTicket;
import com.chuangkit.admin.mapper.SupportTicketMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportTicketService {
    private final SupportTicketMapper mapper;

    public List<SupportTicket> list(Long userId) {
        return mapper.selectList(new LambdaQueryWrapper<SupportTicket>().eq(SupportTicket::getUserId, userId).orderByDesc(SupportTicket::getUpdateTime));
    }

    public SupportTicket create(Long userId, SupportTicketCreateRequest request) {
        SupportTicket ticket = new SupportTicket();
        ticket.setUserId(userId); ticket.setSubject(request.getSubject().trim()); ticket.setContent(request.getContent().trim());
        ticket.setPriority(request.getPriority() == null ? "normal" : request.getPriority()); ticket.setStatus("open");
        mapper.insert(ticket); return ticket;
    }

    public SupportTicket update(Long userId, Long id, SupportTicketUpdateRequest request) {
        SupportTicket ticket = mapper.selectById(id);
        if (ticket == null || !userId.equals(ticket.getUserId())) throw new BusinessException(404, "工单不存在");
        if (!List.of("open", "pending", "resolved", "closed").contains(request.getStatus())) throw new BusinessException("工单状态无效");
        ticket.setStatus(request.getStatus()); if (request.getReply() != null) ticket.setLastReply(request.getReply().trim()); ticket.setUpdateTime(LocalDateTime.now());
        mapper.updateById(ticket); return ticket;
    }
}
