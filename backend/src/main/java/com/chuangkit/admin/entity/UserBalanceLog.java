package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_balance_log")
public class UserBalanceLog {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private Integer changeCents;
    private Integer balanceAfterCents;
    private String bizType;
    private String title;
    private String remark;
    private LocalDateTime createTime;
}
