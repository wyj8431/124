package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.DeviceAlertCreateRequest;
import com.chuangkit.admin.dto.DeviceAlertStatusRequest;
import com.chuangkit.admin.entity.DeviceAlert;
import com.chuangkit.admin.mapper.DeviceAlertMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceAlertService {
    private final DeviceAlertMapper mapper;
    public List<DeviceAlert> list(Long userId) { return mapper.selectList(new LambdaQueryWrapper<DeviceAlert>().eq(DeviceAlert::getUserId, userId).orderByDesc(DeviceAlert::getOccurredAt)); }
    public DeviceAlert create(Long userId, DeviceAlertCreateRequest request) {
        DeviceAlert alert = new DeviceAlert(); alert.setUserId(userId); alert.setDeviceId(request.getDeviceId().trim()); alert.setAlertType(request.getAlertType().trim());
        alert.setSeverity(request.getSeverity() == null ? "warning" : request.getSeverity()); alert.setMessage(request.getMessage().trim()); alert.setStatus("open"); alert.setOccurredAt(LocalDateTime.now());
        mapper.insert(alert); return alert;
    }
    public DeviceAlert update(Long userId, Long id, DeviceAlertStatusRequest request) {
        DeviceAlert alert = mapper.selectById(id); if (alert == null || !userId.equals(alert.getUserId())) throw new BusinessException(404, "告警不存在");
        if (!List.of("open", "acknowledged", "resolved").contains(request.getStatus())) throw new BusinessException("告警状态无效");
        alert.setStatus(request.getStatus()); alert.setResolvedAt("resolved".equals(request.getStatus()) ? LocalDateTime.now() : null); alert.setUpdateTime(LocalDateTime.now()); mapper.updateById(alert); return alert;
    }
}
