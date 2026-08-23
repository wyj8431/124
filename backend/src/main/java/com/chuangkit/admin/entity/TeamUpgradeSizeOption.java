package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("team_upgrade_size_option")
public class TeamUpgradeSizeOption {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String code;
    private String label;
    private Integer maxMembers;
    private Integer sortOrder;
    private Integer status;
}
