package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 工单编号：网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单 */
@Data
@TableName("design_share_link")
public class DesignShareLink {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long designId;
    private Long createdBy;
    private String token;
    private String mode;
    private LocalDateTime expireTime;
    private Integer revoked;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
