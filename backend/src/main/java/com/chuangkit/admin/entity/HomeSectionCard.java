package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("home_section_card")
public class HomeSectionCard {
    @TableId(type = IdType.AUTO) private Long id;
    private String sectionCode;
    private String label;
    private Long templateId;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
