package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("home_feature")
public class HomeFeature {
    @TableId(type = IdType.AUTO) private Long id;
    private String title;
    private String subtitle;
    private String coverUrl;
    private String linkType;
    private String linkValue;
    private String tabCode;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
