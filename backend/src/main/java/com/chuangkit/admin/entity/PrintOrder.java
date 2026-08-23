package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("print_order")
public class PrintOrder {
    @TableId(type = IdType.AUTO) private Long id;
    private String orderNo;
    private Long userId;
    private String productName;
    private Integer quantity;
    private Integer totalPriceCents;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime payTime;
}
