package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("corporate_transfer")
public class CorporateTransfer {
    @TableId(type = IdType.AUTO) private Long id;
    private String transferNo;
    private Long userId;
    private Integer amountCents;
    private String payerName;
    private String remark;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime confirmTime;
}
