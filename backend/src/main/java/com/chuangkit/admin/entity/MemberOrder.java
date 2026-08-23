package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("member_order")
public class MemberOrder {
    @TableId(type = IdType.AUTO) private Long id;
    private String orderNo;
    private Long userId;
    private Long skuId;
    private Integer seatCount;
    private Integer totalPriceCents;
    private Integer originalPriceCents;
    private String payMethod;
    private String status;
    private LocalDate validUntil;
    private String qrPayload;
    private LocalDateTime createTime;
    private LocalDateTime payTime;
}
