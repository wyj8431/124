package com.chuangkit.admin.sms;

public interface SmsSender {
    void send(String phone, String code);
}
