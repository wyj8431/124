package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class TeamOverviewDto {
    private Long teamId;
    private String name;
    private Long ownerId;
    private Integer memberCount;
    private Integer maxMembers;
    private String versionLabel;
    private String currentRole;
    private List<TeamMemberDto> members;
}
