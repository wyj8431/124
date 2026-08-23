package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_coupon")
public class UserCoupon {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private String title;
    private String couponCode;
    private String discountType;
    private Integer discountValue;
    private Integer minAmount;
    private String scopeLabel;
    private Integer status;
    private LocalDateTime expireTime;
    private LocalDateTime usedTime;
    private LocalDateTime createTime;
}
