package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class CouponCenterListDto {
    private List<CouponCenterCouponVo> list;
    private long total;
    private long page;
    private long pageSize;
    private long totalPages;
}
