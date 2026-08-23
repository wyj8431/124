package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AuthRecordListDto {
    private long total;
    private long authorizedCount;
    private List<AuthRecordVo> list = new ArrayList<>();
}
