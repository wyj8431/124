package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("material")
public class Material {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String type;
    private String url;
    private String thumbnail;
    private String category;
    private String tags;
    private Integer isFree;
    private Integer useCount;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
