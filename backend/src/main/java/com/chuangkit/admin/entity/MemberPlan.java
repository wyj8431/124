package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("member_plan")
public class MemberPlan {
    @TableId(type = IdType.AUTO) private Long id;
    private String groupCode;
    private String groupTitle;
    private String groupSubtitle;
    private String name;
    private String description;
    private String iconStyle;
    private String linkUrl;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
