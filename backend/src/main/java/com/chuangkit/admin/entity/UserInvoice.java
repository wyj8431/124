package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_invoice")
public class UserInvoice {
    @TableId(type = IdType.AUTO) private Long id;
    private String invoiceNo;
    private Long userId;
    private String invoiceType;
    private String title;
    private String taxNo;
    private String email;
    private String remark;
    private Integer amountCents;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime issueTime;
}
