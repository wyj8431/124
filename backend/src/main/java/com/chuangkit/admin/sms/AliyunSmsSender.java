package com.chuangkit.admin.sms;

import com.aliyun.dysmsapi20170525.Client;
import com.aliyun.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.dysmsapi20170525.models.SendSmsResponse;
import com.aliyun.teaopenapi.models.Config;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.config.SmsProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AliyunSmsSender implements SmsSender {

    private final SmsProperties props;

    public AliyunSmsSender(SmsProperties props) {
        this.props = props;
    }

    @Override
    public void send(String phone, String code) {
        try {
            Config config = new Config()
                .setAccessKeyId(props.getAliyun().getAccessKeyId())
                .setAccessKeySecret(props.getAliyun().getAccessKeySecret())
                .setEndpoint("dysmsapi.aliyuncs.com");
            Client client = new Client(config);

            SendSmsRequest request = new SendSmsRequest()
                .setPhoneNumbers(phone)
                .setSignName(props.getAliyun().getSignName())
                .setTemplateCode(props.getAliyun().getTemplateCode())
                .setTemplateParam("{\"code\":\"" + code + "\"}");

            SendSmsResponse response = client.sendSms(request);
            String respCode = response.getBody().getCode();
            if (!"OK".equals(respCode)) {
                log.error("阿里云短信发送失败: phone={}, code={}, message={}",
                    phone, respCode, response.getBody().getMessage());
                throw new BusinessException("短信发送失败，请稍后重试");
            }
            log.info("短信验证码已发送至 {}", phone.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2"));
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("阿里云短信异常", e);
            throw new BusinessException("短信服务异常，请稍后重试");
        }
    }
}
