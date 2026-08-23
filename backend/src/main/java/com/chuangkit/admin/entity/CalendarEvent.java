package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("calendar_event")
public class CalendarEvent {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private LocalDate eventDate;
    private String description;
    private String categoryCode;
    private String coverUrl;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
