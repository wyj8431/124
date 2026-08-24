package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("device_alert")
public class DeviceAlert {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private String deviceId;
    private String alertType;
    private String severity;
    private String message;
    private String status;
    private LocalDateTime occurredAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
