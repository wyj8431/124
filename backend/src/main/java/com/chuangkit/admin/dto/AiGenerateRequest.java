package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class AiGenerateRequest {
    /** template / agent / image_gen / video_gen */
    private String mode;
    private String prompt;
    private String model;
    private String aspectRatio;
    private String style;
    /** 参考图 URL 列表（JSON 数组字符串或前端传 List） */
    private java.util.List<String> referenceUrls;
    /** Agent 模式开关 */
    private Boolean agentMode;
    /** 自动模式 */
    private Boolean autoMode;
    /** 快捷 Agent 工具 code */
    private String toolCode;
}
