package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("member_tier")
public class MemberTier {
    @TableId(type = IdType.AUTO) private Long id;
    private String groupCode;
    private String code;
    private String name;
    private String description;
    private Integer minSeats;
    private Integer maxSeats;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
