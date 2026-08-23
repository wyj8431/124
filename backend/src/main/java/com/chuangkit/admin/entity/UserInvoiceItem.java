package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("user_invoice_item")
public class UserInvoiceItem {
    @TableId(type = IdType.AUTO) private Long id;
    private Long invoiceId;
    private Long orderId;
    private String orderNo;
    private String productName;
    private Integer amountCents;
}
