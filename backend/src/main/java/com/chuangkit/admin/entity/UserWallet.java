package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_wallet")
public class UserWallet {
    @TableId
    private Long userId;
    private Integer balanceCents;
    private LocalDateTime updateTime;
}
