package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.PageResult;
import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.*;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.OrderCenterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/order-center")
@RequiredArgsConstructor
public class OrderCenterController {

    private final OrderCenterService orderCenterService;

    @GetMapping("/index")
    public Result<OrderCenterIndexDto> index() {
        SecurityUtils.requireUserId();
        return Result.ok(orderCenterService.getIndex());
    }

    @GetMapping("/orders")
    public Result<PageResult<OrderCenterOrderVo>> orders(
            @RequestParam(defaultValue = "vip") String type,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(orderCenterService.listOrders(userId, type, status, page, pageSize));
    }

    @GetMapping("/orders/{id}")
    public Result<OrderCenterOrderVo> order(@PathVariable Long id) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(orderCenterService.getOrder(userId, id));
    }

    @PostMapping("/orders/{id}/pay")
    public Result<MemberOrderVo> pay(@PathVariable Long id) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(orderCenterService.payOrder(userId, id));
    }

    @PostMapping("/orders/{id}/cancel")
    public Result<Void> cancel(@PathVariable Long id) {
        Long userId = SecurityUtils.requireUserId();
        orderCenterService.cancelOrder(userId, id);
        return Result.ok();
    }

    @GetMapping("/invoices/eligible")
    public Result<List<OrderCenterOrderVo>> eligible() {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(orderCenterService.listEligibleInvoices(userId));
    }

    @PostMapping("/invoices")
    public Result<OrderCenterInvoiceVo> apply(@Valid @RequestBody OrderCenterRequests.ApplyInvoice req) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(orderCenterService.applyInvoice(userId, req));
    }

    @GetMapping("/invoices")
    public Result<PageResult<OrderCenterInvoiceVo>> invoices(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(orderCenterService.listInvoices(userId, page, pageSize));
    }

    @GetMapping("/transfers")
    public Result<PageResult<OrderCenterTransferVo>> transfers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(orderCenterService.listTransfers(userId, page, pageSize));
    }

    @PostMapping("/transfers")
    public Result<OrderCenterTransferVo> submitTransfer(@Valid @RequestBody OrderCenterRequests.SubmitTransfer req) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(orderCenterService.submitTransfer(userId, req));
    }

    @GetMapping("/balance")
    public Result<OrderCenterBalanceDto> balance(@RequestParam(defaultValue = "all") String tab) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(orderCenterService.getBalance(userId, tab));
    }
}
