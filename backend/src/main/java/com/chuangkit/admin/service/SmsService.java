package com.chuangkit.admin.service;

import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.config.SmsProperties;
import com.chuangkit.admin.sms.AliyunSmsSender;
import com.chuangkit.admin.sms.MockSmsSender;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class SmsService {

    private record CodeEntry(String code, long expireAt) {}

    private final Map<String, CodeEntry> codeStore = new ConcurrentHashMap<>();
    private final Map<String, Long> lastSendTime = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private final SmsProperties smsProperties;
    private final AliyunSmsSender aliyunSmsSender;
    private final MockSmsSender mockSmsSender;

    public SmsService(SmsProperties smsProperties,
                      AliyunSmsSender aliyunSmsSender,
                      MockSmsSender mockSmsSender) {
        this.smsProperties = smsProperties;
        this.aliyunSmsSender = aliyunSmsSender;
        this.mockSmsSender = mockSmsSender;
    }

    /** 发送验证码，返回是否使用真实短信通道 */
    public SendResult sendCode(String phone) {
        if (!phone.matches("^1[3-9]\\d{9}$")) {
            throw new BusinessException("请输入正确的手机号");
        }

        long now = Instant.now().getEpochSecond();
        Long last = lastSendTime.get(phone);
        if (last != null && now - last < smsProperties.getResendIntervalSeconds()) {
            long wait = smsProperties.getResendIntervalSeconds() - (now - last);
            throw new BusinessException("请" + wait + "秒后再试");
        }

        String code = String.format("%06d", random.nextInt(1_000_000));
        long expireAt = now + smsProperties.getCodeExpireMinutes() * 60L;
        codeStore.put(phone, new CodeEntry(code, expireAt));
        lastSendTime.put(phone, now);

        boolean realSms = smsProperties.isAliyunEnabled();
        if (realSms) {
            aliyunSmsSender.send(phone, code);
        } else {
            mockSmsSender.send(phone, code);
        }

        return new SendResult(realSms, realSms ? null : code);
    }

    public void verify(String phone, String code) {
        CodeEntry entry = codeStore.get(phone);
        if (entry == null) {
            throw new BusinessException("验证码错误或已过期");
        }
        if (Instant.now().getEpochSecond() > entry.expireAt()) {
            codeStore.remove(phone);
            throw new BusinessException("验证码已过期，请重新获取");
        }
        if (!entry.code().equals(code)) {
            throw new BusinessException("验证码错误");
        }
        codeStore.remove(phone);
    }

    public record SendResult(boolean realSms, String debugCode) {}
}
