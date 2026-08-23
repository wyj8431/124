package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class OrderCenterBalanceDto {
    private Integer balance;
    private String balanceLabel;
    private List<LogItem> logs = new ArrayList<>();

    @Data
    public static class LogItem {
        private Long id;
        private String title;
        private String remark;
        private Integer changeCents;
        private String changeLabel;
        private String bizType;
        private String createTime;
        private boolean income;
    }
}
