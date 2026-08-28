package com.chuangkit.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MattingTaskDto {
    private Long id;
    private Integer status;
    private String sourceUrl;
    private String outputUrl;
    private String errorMsg;
    private boolean mock;
    private LocalDateTime createTime;
    private LocalDateTime finishTime;
}
