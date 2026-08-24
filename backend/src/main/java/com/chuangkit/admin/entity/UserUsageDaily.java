package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("user_usage_daily")
public class UserUsageDaily {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private LocalDate usageDate;
    private Integer createCount;
    private Integer saveCount;
    private Integer exportCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
