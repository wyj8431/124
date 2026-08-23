package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("member_benefit")
public class MemberBenefit {
    @TableId(type = IdType.AUTO) private Long id;
    private Long tierId;
    private String title;
    private String description;
    private String icon;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
