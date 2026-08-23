package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("member_sku")
public class MemberSku {
    @TableId(type = IdType.AUTO) private Long id;
    private Long tierId;
    private String name;
    private Integer priceCents;
    private Integer originalPriceCents;
    private String badgeText;
    private String footerText;
    private String perMonthText;
    private Integer durationMonths;
    private Integer isAutoRenew;
    private String autoRenewTip;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
