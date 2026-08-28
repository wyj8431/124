package com.chuangkit.admin.dto;

import lombok.Data;

/** 公开分享解析结果；不返回用户隐私和内部权限字段。 */
@Data
public class DesignShareAccessDto {
    private Long designId;
    private String title;
    private String canvasJson;
    private String coverUrl;
    private Long revision;
    private Integer width;
    private Integer height;
    private String mode;
    private String token;
}
