package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("team_member")
public class TeamMember {
    @TableId(type = IdType.AUTO) private Long id;
    private Long teamId;
    private Long userId;
    private String role;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
