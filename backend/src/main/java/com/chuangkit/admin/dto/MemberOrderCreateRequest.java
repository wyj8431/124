package com.chuangkit.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MemberOrderCreateRequest {
    @NotNull private Long skuId;
    @Min(1) private Integer seatCount = 1;
    @NotBlank private String payMethod;
}
