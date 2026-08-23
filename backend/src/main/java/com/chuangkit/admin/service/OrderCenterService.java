package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.common.PageResult;
import com.chuangkit.admin.dto.*;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderCenterService {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final MemberOrderMapper memberOrderMapper;
    private final MemberSkuMapper skuMapper;
    private final MemberTierMapper tierMapper;
    private final PrintOrderMapper printOrderMapper;
    private final UserInvoiceMapper invoiceMapper;
    private final UserInvoiceItemMapper invoiceItemMapper;
    private final CorporateTransferMapper transferMapper;
    private final UserWalletMapper walletMapper;
    private final UserBalanceLogMapper balanceLogMapper;
    private final MemberCheckoutService checkoutService;

    public OrderCenterIndexDto getIndex() {
        OrderCenterIndexDto dto = new OrderCenterIndexDto();
        dto.setEmptyText("暂时没有任何订单");
        dto.setEmptyInvoiceText("暂无可开票订单，支付成功后可在此申请发票");
        dto.setEmptyHistoryText("暂时没有开票记录");
        dto.setEmptyBalanceText("暂无收支记录");
        dto.setNavItems(List.of(
            nav("vip", "VIP订单", "/usercenter/vip"),
            nav("seat", "席位订单", "/usercenter/seat"),
            nav("print", "印刷订单", "/usercenter/print"),
            nav("transfer", "对公转账", "/usercenter/transfer"),
            nav("balance", "余额收支", "/usercenter/balance"),
            nav("invoice", "申请发票", "/usercenter/invoice"),
            nav("invoice-history", "开票历史", "/usercenter/invoice-history")
        ));
        dto.setOrderTabs(List.of(
            tab("all", "全部订单"),
            tab("pending", "待支付"),
            tab("paid", "已完成")
        ));
        dto.setBalanceTabs(List.of(
            tab("all", "全部"),
            tab("income", "收入"),
            tab("expense", "支出")
        ));
        dto.setInvoiceTypes(List.of(
            invoiceType("enterprise", "企业单位"),
            invoiceType("personal", "个人")
        ));

        OrderCenterIndexDto.BankAccount bank = new OrderCenterIndexDto.BankAccount();
        bank.setCompanyName("杭州灵图工坊网络科技有限公司");
        bank.setBankName("招商银行杭州分行营业部");
        bank.setAccountNo("5719 1234 5678 901");
        bank.setTaxNo("91330100MA2XXXXX1X");
        bank.setRemark("请在转账备注中填写灵图工坊用户ID");
        bank.setTip("对公转账到账后请提交转账信息，财务将在 1-2 个工作日内确认。");
        dto.setBankAccount(bank);
        return dto;
    }

    public PageResult<OrderCenterOrderVo> listOrders(Long userId, String type, String status, int page, int pageSize) {
        if ("print".equals(type)) {
            return listPrintOrders(userId, status, page, pageSize);
        }
        return listMemberOrders(userId, type, status, page, pageSize);
    }

    public OrderCenterOrderVo getOrder(Long userId, Long orderId) {
        MemberOrder order = memberOrderMapper.selectById(orderId);
        if (order == null || !Objects.equals(order.getUserId(), userId)) {
            throw new BusinessException("订单不存在");
        }
        Map<Long, MemberSku> skuMap = loadSkuMap(List.of(order));
        Map<Long, MemberTier> tierMap = loadTierMap(skuMap);
        Set<Long> invoiced = invoicedOrderIds(List.of(order.getId()));
        return toMemberOrderVo(order, skuMap, tierMap, invoiced);
    }

    public MemberOrderVo payOrder(Long userId, Long orderId) {
        return checkoutService.simulatePay(userId, orderId);
    }

    public void cancelOrder(Long userId, Long orderId) {
        MemberOrder order = memberOrderMapper.selectById(orderId);
        if (order == null || !Objects.equals(order.getUserId(), userId)) {
            throw new BusinessException("订单不存在");
        }
        if (!"pending".equals(order.getStatus())) {
            throw new BusinessException("仅待支付订单可取消");
        }
        order.setStatus("cancelled");
        memberOrderMapper.updateById(order);
    }

    public List<OrderCenterOrderVo> listEligibleInvoices(Long userId) {
        List<MemberOrder> orders = memberOrderMapper.selectList(
            new LambdaQueryWrapper<MemberOrder>()
                .eq(MemberOrder::getUserId, userId)
                .eq(MemberOrder::getStatus, "paid")
                .orderByDesc(MemberOrder::getCreateTime));
        if (orders.isEmpty()) {
            return List.of();
        }
        Set<Long> invoiced = invoicedOrderIds(orders.stream().map(MemberOrder::getId).toList());
        Map<Long, MemberSku> skuMap = loadSkuMap(orders);
        Map<Long, MemberTier> tierMap = loadTierMap(skuMap);
        return orders.stream()
            .filter(o -> !invoiced.contains(o.getId()))
            .map(o -> toMemberOrderVo(o, skuMap, tierMap, invoiced))
            .collect(Collectors.toList());
    }

    @Transactional
    public OrderCenterInvoiceVo applyInvoice(Long userId, OrderCenterRequests.ApplyInvoice req) {
        String type = req.getInvoiceType().trim();
        if (!"personal".equals(type) && !"enterprise".equals(type)) {
            throw new BusinessException("发票类型不正确");
        }
        if ("enterprise".equals(type) && !StringUtils.hasText(req.getTaxNo())) {
            throw new BusinessException("企业开票需填写纳税人识别号");
        }

        List<MemberOrder> orders = memberOrderMapper.selectList(
            new LambdaQueryWrapper<MemberOrder>()
                .eq(MemberOrder::getUserId, userId)
                .in(MemberOrder::getId, req.getOrderIds()));
        if (orders.size() != req.getOrderIds().size()) {
            throw new BusinessException("存在无效订单");
        }
        Set<Long> invoiced = invoicedOrderIds(req.getOrderIds());
        for (MemberOrder order : orders) {
            if (!"paid".equals(order.getStatus())) {
                throw new BusinessException("仅已支付订单可开票");
            }
            if (invoiced.contains(order.getId())) {
                throw new BusinessException("订单 " + order.getOrderNo() + " 已申请过发票");
            }
        }

        int amount = orders.stream().mapToInt(MemberOrder::getTotalPriceCents).sum();
        Map<Long, MemberSku> skuMap = loadSkuMap(orders);
        Map<Long, MemberTier> tierMap = loadTierMap(skuMap);

        UserInvoice invoice = new UserInvoice();
        invoice.setInvoiceNo("INV" + System.currentTimeMillis() + userId);
        invoice.setUserId(userId);
        invoice.setInvoiceType(type);
        invoice.setTitle(req.getTitle().trim());
        invoice.setTaxNo(StringUtils.hasText(req.getTaxNo()) ? req.getTaxNo().trim() : null);
        invoice.setEmail(req.getEmail().trim());
        invoice.setRemark(req.getRemark());
        invoice.setAmountCents(amount);
        invoice.setStatus("issued");
        invoice.setIssueTime(LocalDateTime.now());
        invoice.setCreateTime(LocalDateTime.now());
        invoiceMapper.insert(invoice);

        for (MemberOrder order : orders) {
            UserInvoiceItem item = new UserInvoiceItem();
            item.setInvoiceId(invoice.getId());
            item.setOrderId(order.getId());
            item.setOrderNo(order.getOrderNo());
            item.setProductName(resolveProductName(order, skuMap, tierMap));
            item.setAmountCents(order.getTotalPriceCents());
            invoiceItemMapper.insert(item);
        }
        return toInvoiceVo(invoice, listInvoiceItems(List.of(invoice.getId())));
    }

    public PageResult<OrderCenterInvoiceVo> listInvoices(Long userId, int page, int pageSize) {
        Page<UserInvoice> p = invoiceMapper.selectPage(
            new Page<>(page, pageSize),
            new LambdaQueryWrapper<UserInvoice>()
                .eq(UserInvoice::getUserId, userId)
                .orderByDesc(UserInvoice::getCreateTime));
        List<Long> ids = p.getRecords().stream().map(UserInvoice::getId).toList();
        Map<Long, List<UserInvoiceItem>> itemMap = listInvoiceItems(ids);
        List<OrderCenterInvoiceVo> list = p.getRecords().stream()
            .map(inv -> toInvoiceVo(inv, itemMap))
            .toList();
        return PageResult.of(p, list);
    }

    public PageResult<OrderCenterTransferVo> listTransfers(Long userId, int page, int pageSize) {
        Page<CorporateTransfer> p = transferMapper.selectPage(
            new Page<>(page, pageSize),
            new LambdaQueryWrapper<CorporateTransfer>()
                .eq(CorporateTransfer::getUserId, userId)
                .orderByDesc(CorporateTransfer::getCreateTime));
        List<OrderCenterTransferVo> list = p.getRecords().stream().map(this::toTransferVo).toList();
        return PageResult.of(p, list);
    }

    public OrderCenterTransferVo submitTransfer(Long userId, OrderCenterRequests.SubmitTransfer req) {
        CorporateTransfer transfer = new CorporateTransfer();
        transfer.setTransferNo("TR" + System.currentTimeMillis() + userId);
        transfer.setUserId(userId);
        transfer.setAmountCents(req.getAmountCents());
        transfer.setPayerName(req.getPayerName().trim());
        transfer.setRemark(req.getRemark());
        transfer.setStatus("pending");
        transfer.setCreateTime(LocalDateTime.now());
        transferMapper.insert(transfer);
        return toTransferVo(transfer);
    }

    public OrderCenterBalanceDto getBalance(Long userId, String tab) {
        UserWallet wallet = walletMapper.selectById(userId);
        int balance = wallet != null && wallet.getBalanceCents() != null ? wallet.getBalanceCents() : 0;

        LambdaQueryWrapper<UserBalanceLog> qw = new LambdaQueryWrapper<UserBalanceLog>()
            .eq(UserBalanceLog::getUserId, userId)
            .orderByDesc(UserBalanceLog::getCreateTime);
        if ("income".equals(tab)) {
            qw.gt(UserBalanceLog::getChangeCents, 0);
        } else if ("expense".equals(tab)) {
            qw.lt(UserBalanceLog::getChangeCents, 0);
        }
        List<UserBalanceLog> logs = balanceLogMapper.selectList(qw);

        OrderCenterBalanceDto dto = new OrderCenterBalanceDto();
        dto.setBalance(balance / 100);
        dto.setBalanceLabel(formatYuan(balance));
        dto.setLogs(logs.stream().map(this::toBalanceLog).toList());
        return dto;
    }

    private PageResult<OrderCenterOrderVo> listMemberOrders(
        Long userId, String type, String status, int page, int pageSize
    ) {
        LambdaQueryWrapper<MemberOrder> qw = new LambdaQueryWrapper<MemberOrder>()
            .eq(MemberOrder::getUserId, userId)
            .orderByDesc(MemberOrder::getCreateTime);
        if ("vip".equals(type)) {
            qw.and(w -> w.isNull(MemberOrder::getSeatCount).or().le(MemberOrder::getSeatCount, 1));
        } else if ("seat".equals(type)) {
            qw.gt(MemberOrder::getSeatCount, 1);
        }
        if ("pending".equals(status)) {
            qw.eq(MemberOrder::getStatus, "pending");
        } else if ("paid".equals(status)) {
            qw.eq(MemberOrder::getStatus, "paid");
        }

        Page<MemberOrder> p = memberOrderMapper.selectPage(new Page<>(page, pageSize), qw);
        if (p.getRecords().isEmpty()) {
            return PageResult.of(p, List.of());
        }
        Map<Long, MemberSku> skuMap = loadSkuMap(p.getRecords());
        Map<Long, MemberTier> tierMap = loadTierMap(skuMap);
        Set<Long> invoiced = invoicedOrderIds(p.getRecords().stream().map(MemberOrder::getId).toList());
        List<OrderCenterOrderVo> list = p.getRecords().stream()
            .map(o -> toMemberOrderVo(o, skuMap, tierMap, invoiced))
            .toList();
        return PageResult.of(p, list);
    }

    private PageResult<OrderCenterOrderVo> listPrintOrders(Long userId, String status, int page, int pageSize) {
        LambdaQueryWrapper<PrintOrder> qw = new LambdaQueryWrapper<PrintOrder>()
            .eq(PrintOrder::getUserId, userId)
            .orderByDesc(PrintOrder::getCreateTime);
        if ("pending".equals(status)) {
            qw.eq(PrintOrder::getStatus, "pending");
        } else if ("paid".equals(status)) {
            qw.in(PrintOrder::getStatus, List.of("paid", "completed"));
        }
        Page<PrintOrder> p = printOrderMapper.selectPage(new Page<>(page, pageSize), qw);
        List<OrderCenterOrderVo> list = p.getRecords().stream().map(this::toPrintOrderVo).toList();
        return PageResult.of(p, list);
    }

    private OrderCenterOrderVo toMemberOrderVo(
        MemberOrder order,
        Map<Long, MemberSku> skuMap,
        Map<Long, MemberTier> tierMap,
        Set<Long> invoiced
    ) {
        OrderCenterOrderVo vo = new OrderCenterOrderVo();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setProductName(resolveProductName(order, skuMap, tierMap));
        int seats = order.getSeatCount() != null ? order.getSeatCount() : 1;
        vo.setSeatCount(seats);
        vo.setProductDesc(seats > 1 ? seats + " 席位" : "个人会员");
        vo.setAmount(order.getTotalPriceCents() / 100);
        vo.setAmountLabel(formatYuan(order.getTotalPriceCents()));
        vo.setStatus(order.getStatus());
        vo.setStatusLabel(statusLabel(order.getStatus()));
        vo.setPayMethod(order.getPayMethod());
        vo.setPayMethodLabel(payMethodLabel(order.getPayMethod()));
        vo.setCreateTime(formatDateTime(order.getCreateTime()));
        vo.setPayTime(formatDateTime(order.getPayTime()));
        vo.setCanPay("pending".equals(order.getStatus()));
        vo.setCanCancel("pending".equals(order.getStatus()));
        vo.setCanInvoice("paid".equals(order.getStatus()) && !invoiced.contains(order.getId()));
        if (order.getQrPayload() != null) {
            vo.setQrCodeUrl(buildQrUrl(order.getQrPayload()));
        }
        return vo;
    }

    private OrderCenterOrderVo toPrintOrderVo(PrintOrder order) {
        OrderCenterOrderVo vo = new OrderCenterOrderVo();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setProductName(order.getProductName());
        vo.setProductDesc("数量 " + (order.getQuantity() != null ? order.getQuantity() : 1));
        vo.setAmount(order.getTotalPriceCents() / 100);
        vo.setAmountLabel(formatYuan(order.getTotalPriceCents()));
        vo.setStatus(order.getStatus());
        vo.setStatusLabel(statusLabel(order.getStatus()));
        vo.setCreateTime(formatDateTime(order.getCreateTime()));
        vo.setPayTime(formatDateTime(order.getPayTime()));
        vo.setCanPay("pending".equals(order.getStatus()));
        vo.setCanCancel(false);
        vo.setCanInvoice(false);
        return vo;
    }

    private String resolveProductName(MemberOrder order, Map<Long, MemberSku> skuMap, Map<Long, MemberTier> tierMap) {
        MemberSku sku = skuMap.get(order.getSkuId());
        if (sku == null) {
            return "会员订单";
        }
        MemberTier tier = sku.getTierId() != null ? tierMap.get(sku.getTierId()) : null;
        if (tier != null && StringUtils.hasText(tier.getName())) {
            return tier.getName() + " · " + sku.getName();
        }
        return sku.getName();
    }

    private Map<Long, MemberSku> loadSkuMap(List<MemberOrder> orders) {
        Set<Long> ids = orders.stream().map(MemberOrder::getSkuId).filter(Objects::nonNull).collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        return skuMapper.selectBatchIds(ids).stream().collect(Collectors.toMap(MemberSku::getId, s -> s));
    }

    private Map<Long, MemberTier> loadTierMap(Map<Long, MemberSku> skuMap) {
        Set<Long> ids = skuMap.values().stream().map(MemberSku::getTierId).filter(Objects::nonNull).collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        return tierMapper.selectBatchIds(ids).stream().collect(Collectors.toMap(MemberTier::getId, t -> t));
    }

    private Set<Long> invoicedOrderIds(List<Long> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            return Set.of();
        }
        return invoiceItemMapper.selectList(
                new LambdaQueryWrapper<UserInvoiceItem>().in(UserInvoiceItem::getOrderId, orderIds))
            .stream()
            .map(UserInvoiceItem::getOrderId)
            .collect(Collectors.toSet());
    }

    private Map<Long, List<UserInvoiceItem>> listInvoiceItems(List<Long> invoiceIds) {
        if (invoiceIds == null || invoiceIds.isEmpty()) {
            return Map.of();
        }
        return invoiceItemMapper.selectList(
                new LambdaQueryWrapper<UserInvoiceItem>().in(UserInvoiceItem::getInvoiceId, invoiceIds))
            .stream()
            .collect(Collectors.groupingBy(UserInvoiceItem::getInvoiceId));
    }

    private OrderCenterInvoiceVo toInvoiceVo(UserInvoice invoice, Map<Long, List<UserInvoiceItem>> itemMap) {
        OrderCenterInvoiceVo vo = new OrderCenterInvoiceVo();
        vo.setId(invoice.getId());
        vo.setInvoiceNo(invoice.getInvoiceNo());
        vo.setInvoiceType(invoice.getInvoiceType());
        vo.setInvoiceTypeLabel("enterprise".equals(invoice.getInvoiceType()) ? "企业单位" : "个人");
        vo.setTitle(invoice.getTitle());
        vo.setTaxNo(invoice.getTaxNo());
        vo.setEmail(invoice.getEmail());
        vo.setAmount(invoice.getAmountCents() / 100);
        vo.setAmountLabel(formatYuan(invoice.getAmountCents()));
        vo.setStatus(invoice.getStatus());
        vo.setStatusLabel("issued".equals(invoice.getStatus()) ? "已开具" : "开票中");
        vo.setCreateTime(formatDateTime(invoice.getCreateTime()));
        vo.setIssueTime(formatDateTime(invoice.getIssueTime()));
        List<UserInvoiceItem> items = itemMap.getOrDefault(invoice.getId(), List.of());
        vo.setItems(items.stream().map(it -> {
            OrderCenterInvoiceVo.Item item = new OrderCenterInvoiceVo.Item();
            item.setOrderId(it.getOrderId());
            item.setOrderNo(it.getOrderNo());
            item.setProductName(it.getProductName());
            item.setAmountLabel(formatYuan(it.getAmountCents()));
            return item;
        }).toList());
        return vo;
    }

    private OrderCenterTransferVo toTransferVo(CorporateTransfer transfer) {
        OrderCenterTransferVo vo = new OrderCenterTransferVo();
        vo.setId(transfer.getId());
        vo.setTransferNo(transfer.getTransferNo());
        vo.setAmount(transfer.getAmountCents() / 100);
        vo.setAmountLabel(formatYuan(transfer.getAmountCents()));
        vo.setPayerName(transfer.getPayerName());
        vo.setRemark(transfer.getRemark());
        vo.setStatus(transfer.getStatus());
        vo.setStatusLabel(switch (transfer.getStatus()) {
            case "confirmed" -> "已确认";
            case "rejected" -> "已驳回";
            default -> "待确认";
        });
        vo.setCreateTime(formatDateTime(transfer.getCreateTime()));
        return vo;
    }

    private OrderCenterBalanceDto.LogItem toBalanceLog(UserBalanceLog log) {
        OrderCenterBalanceDto.LogItem item = new OrderCenterBalanceDto.LogItem();
        item.setId(log.getId());
        item.setTitle(log.getTitle());
        item.setRemark(log.getRemark());
        item.setChangeCents(log.getChangeCents());
        item.setIncome(log.getChangeCents() > 0);
        String sign = log.getChangeCents() > 0 ? "+" : "";
        item.setChangeLabel(sign + formatYuan(log.getChangeCents()));
        item.setBizType(log.getBizType());
        item.setCreateTime(formatDateTime(log.getCreateTime()));
        return item;
    }

    private OrderCenterIndexDto.NavItem nav(String code, String name, String path) {
        OrderCenterIndexDto.NavItem item = new OrderCenterIndexDto.NavItem();
        item.setCode(code);
        item.setName(name);
        item.setRoutePath(path);
        return item;
    }

    private OrderCenterIndexDto.TabItem tab(String code, String name) {
        OrderCenterIndexDto.TabItem item = new OrderCenterIndexDto.TabItem();
        item.setCode(code);
        item.setName(name);
        return item;
    }

    private OrderCenterIndexDto.InvoiceTypeOption invoiceType(String code, String name) {
        OrderCenterIndexDto.InvoiceTypeOption item = new OrderCenterIndexDto.InvoiceTypeOption();
        item.setCode(code);
        item.setName(name);
        return item;
    }

    private String statusLabel(String status) {
        if (status == null) return "";
        return switch (status) {
            case "pending" -> "待支付";
            case "paid", "completed" -> "已完成";
            case "cancelled" -> "已取消";
            default -> status;
        };
    }

    private String payMethodLabel(String method) {
        if (method == null) return "";
        return switch (method) {
            case "wechat" -> "微信支付";
            case "alipay" -> "支付宝";
            default -> method;
        };
    }

    private String formatYuan(int cents) {
        if (cents % 100 == 0) {
            return "¥" + (cents / 100);
        }
        return String.format("¥%.2f", cents / 100.0);
    }

    private String formatDateTime(LocalDateTime time) {
        return time == null ? "" : time.format(DATE_TIME);
    }

    private String buildQrUrl(String payload) {
        String encoded = URLEncoder.encode(payload, StandardCharsets.UTF_8);
        return "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encoded;
    }
}
