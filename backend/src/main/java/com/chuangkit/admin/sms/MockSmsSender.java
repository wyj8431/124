package com.chuangkit.admin.sms;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MockSmsSender implements SmsSender {

    @Override
    public void send(String phone, String code) {
        log.info("[Mock SMS] 手机号 {} 验证码: {} （开发环境，未配置真实短信通道）",
            phone.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2"), code);
    }
}
