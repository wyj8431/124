package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("team")
public class Team {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private Long ownerId;
    private Integer memberCount;
    private Integer maxMembers;
    private String versionType;
    private String versionLabel;
    private Long storageUsedBytes;
    private Long storageTotalBytes;
    private Integer pointsBalance;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
