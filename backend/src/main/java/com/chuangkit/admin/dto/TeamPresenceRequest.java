package com.chuangkit.admin.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TeamPresenceRequest {
    @Pattern(regexp = "online|away|offline", message = "协作状态只能是 online、away 或 offline")
    private String status = "online";
}
