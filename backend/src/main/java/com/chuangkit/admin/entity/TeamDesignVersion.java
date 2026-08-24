package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("team_design_version")
public class TeamDesignVersion {
    @TableId(type = IdType.AUTO) private Long id;
    private Long teamId;
    private Long designId;
    private Integer versionNo;
    private Long userId;
    private String canvasJson;
    private String note;
    private LocalDateTime createTime;
}
