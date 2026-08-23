package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("design_auth_record")
public class DesignAuthRecord {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private Long designId;
    private String authNo;
    private String designTitle;
    private String coverUrl;
    private String authType;
    private String authTypeLabel;
    private String licenseHolder;
    private String licenseNo;
    private Integer width;
    private Integer height;
    private LocalDateTime authTime;
    private Integer certVersion;
    private Integer status;
    private LocalDateTime createTime;
}
