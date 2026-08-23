package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/admin/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/index")
    public Result<?> index() {
        return Result.ok(calendarService.getCalendarIndex());
    }

    @GetMapping("/events")
    public Result<?> events(@RequestParam(required = false) String categories) {
        List<String> codes = categories == null || categories.isBlank()
            ? null
            : Arrays.asList(categories.split(","));
        return Result.ok(calendarService.listUpcomingEvents(codes));
    }

    @GetMapping("/events/{id}/templates")
    public Result<?> eventTemplates(
            @PathVariable Long id,
            @RequestParam(required = false) String scene,
            @RequestParam(defaultValue = "48") int limit) {
        return Result.ok(calendarService.listTemplatesByEvent(id, scene, limit));
    }
}
