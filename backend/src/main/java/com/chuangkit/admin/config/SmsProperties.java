package com.chuangkit.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "chuangkit.sms")
public class SmsProperties {

    /** mock=控制台模拟 | aliyun=阿里云短信 */
    private String provider = "mock";
    private int codeExpireMinutes = 5;
    private int resendIntervalSeconds = 60;
    /** 开发模式下是否在 API 响应中返回验证码（生产务必 false） */
    private boolean exposeDebugCode = true;
    private Aliyun aliyun = new Aliyun();

    @Data
    public static class Aliyun {
        private String accessKeyId = "";
        private String accessKeySecret = "";
        private String signName = "";
        private String templateCode = "";
    }

    public boolean isAliyunEnabled() {
        return "aliyun".equalsIgnoreCase(provider)
            && aliyun.accessKeyId != null && !aliyun.accessKeyId.isBlank()
            && aliyun.accessKeySecret != null && !aliyun.accessKeySecret.isBlank()
            && aliyun.signName != null && !aliyun.signName.isBlank()
            && aliyun.templateCode != null && !aliyun.templateCode.isBlank();
    }
}
