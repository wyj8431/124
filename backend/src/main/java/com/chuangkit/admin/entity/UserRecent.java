package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user_recent")
public class UserRecent {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private String targetType;
    private Long targetId;
    private LocalDateTime createTime;
}
