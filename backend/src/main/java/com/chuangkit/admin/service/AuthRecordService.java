package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.*;
import com.chuangkit.admin.entity.DesignAuthRecord;
import com.chuangkit.admin.entity.SysUser;
import com.chuangkit.admin.entity.UserDesign;
import com.chuangkit.admin.mapper.DesignAuthRecordMapper;
import com.chuangkit.admin.mapper.SysUserMapper;
import com.chuangkit.admin.mapper.UserDesignMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthRecordService {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final DesignAuthRecordMapper authRecordMapper;
    private final UserDesignMapper designMapper;
    private final SysUserMapper userMapper;

    public AuthRecordIndexDto getIndex(Long userId) {
        SecurityUtilsRequire(userId);
        LocalDate today = LocalDate.now();
        AuthRecordIndexDto dto = new AuthRecordIndexDto();
        dto.setPageTitle("设计授权记录");
        dto.setEmptyText("暂无授权记录");
        dto.setSearchPlaceholder("搜索已授权的设计作品");
        dto.setBatchDownloadText("批量下载授权书");
        dto.setBatchDownloadTip("仅下载最新授权书");
        dto.setDefaultStartDate(today.withDayOfMonth(1).format(DATE));
        dto.setDefaultEndDate(today.format(DATE));
        return dto;
    }

    public AuthRecordListDto listRecords(
        Long userId,
        String keyword,
        String startDate,
        String endDate,
        int page,
        int pageSize
    ) {
        LambdaQueryWrapper<DesignAuthRecord> filter = filterQuery(userId, keyword, startDate, endDate);
        long totalCount = authRecordMapper.selectCount(filterQuery(userId, null, null, null));

        Page<DesignAuthRecord> p = authRecordMapper.selectPage(
            new Page<>(page, pageSize),
            filter.orderByDesc(DesignAuthRecord::getAuthTime));
        AuthRecordListDto dto = new AuthRecordListDto();
        dto.setTotal(p.getTotal());
        dto.setAuthorizedCount(totalCount);
        dto.setList(p.getRecords().stream().map(this::toVo).toList());
        return dto;
    }

    public AuthRecordBatchDownloadDto batchDownload(Long userId, AuthRecordBatchDownloadRequest req) {
        if (req.getIds() == null || req.getIds().isEmpty()) {
            throw new BusinessException("请选择要下载的授权作品");
        }
        List<DesignAuthRecord> records = authRecordMapper.selectList(
            new LambdaQueryWrapper<DesignAuthRecord>()
                .eq(DesignAuthRecord::getUserId, userId)
                .in(DesignAuthRecord::getId, req.getIds())
                .orderByDesc(DesignAuthRecord::getAuthTime));
        if (records.isEmpty()) {
            throw new BusinessException("未找到授权记录");
        }

        List<DesignAuthRecord> targets = req.isLatestOnly()
            ? pickLatestByDesign(records)
            : records;

        AuthRecordBatchDownloadDto dto = new AuthRecordBatchDownloadDto();
        dto.setCount(targets.size());
        dto.setFiles(targets.stream().map(this::buildCertFile).toList());
        return dto;
    }

    @Transactional
    public void syncForCompletedDesign(Long userId, Long designId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null || user.getMemberLevel() == null || user.getMemberLevel() <= 0) {
            return;
        }
        UserDesign design = designMapper.selectById(designId);
        if (design == null || !Objects.equals(design.getUserId(), userId) || design.getStatus() == null || design.getStatus() != 2) {
            return;
        }
        createRecordIfAbsent(user, design);
    }

    @Transactional
    public int syncOnMemberPay(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null || user.getMemberLevel() == null || user.getMemberLevel() <= 0) {
            return 0;
        }
        List<UserDesign> designs = designMapper.selectList(
            new LambdaQueryWrapper<UserDesign>()
                .eq(UserDesign::getUserId, userId)
                .eq(UserDesign::getStatus, 2));
        int created = 0;
        for (UserDesign design : designs) {
            if (createRecordIfAbsent(user, design)) {
                created++;
            }
        }
        return created;
    }

    private boolean createRecordIfAbsent(SysUser user, UserDesign design) {
        Long exists = authRecordMapper.selectCount(
            new LambdaQueryWrapper<DesignAuthRecord>()
                .eq(DesignAuthRecord::getUserId, user.getId())
                .eq(DesignAuthRecord::getDesignId, design.getId()));
        if (exists != null && exists > 0) {
            return false;
        }
        DesignAuthRecord record = buildRecord(user, design);
        authRecordMapper.insert(record);
        return true;
    }

    private DesignAuthRecord buildRecord(SysUser user, UserDesign design) {
        DesignAuthRecord record = new DesignAuthRecord();
        record.setUserId(user.getId());
        record.setDesignId(design.getId());
        record.setAuthNo("AUTH" + System.currentTimeMillis() + design.getId());
        record.setDesignTitle(design.getTitle());
        record.setCoverUrl(design.getCoverUrl());
        record.setAuthType("commercial");
        record.setAuthTypeLabel(resolveAuthTypeLabel(user.getMemberLevel()));
        record.setLicenseHolder(resolveLicenseHolder(user));
        record.setLicenseNo("91330100MA2USER" + String.format("%04d", user.getId()));
        record.setWidth(design.getWidth());
        record.setHeight(design.getHeight());
        record.setAuthTime(LocalDateTime.now());
        record.setCertVersion(1);
        record.setStatus(1);
        record.setCreateTime(LocalDateTime.now());
        return record;
    }

    private LambdaQueryWrapper<DesignAuthRecord> filterQuery(
        Long userId, String keyword, String startDate, String endDate
    ) {
        LambdaQueryWrapper<DesignAuthRecord> qw = new LambdaQueryWrapper<DesignAuthRecord>()
            .eq(DesignAuthRecord::getUserId, userId)
            .eq(DesignAuthRecord::getStatus, 1);
        if (StringUtils.hasText(keyword)) {
            String q = keyword.trim();
            qw.and(w -> w.like(DesignAuthRecord::getDesignTitle, q).or().like(DesignAuthRecord::getAuthNo, q));
        }
        LocalDateTime start = parseStart(startDate);
        LocalDateTime end = parseEnd(endDate);
        if (start != null) {
            qw.ge(DesignAuthRecord::getAuthTime, start);
        }
        if (end != null) {
            qw.le(DesignAuthRecord::getAuthTime, end);
        }
        return qw;
    }

    private AuthRecordVo toVo(DesignAuthRecord record) {
        AuthRecordVo vo = new AuthRecordVo();
        vo.setId(record.getId());
        vo.setDesignId(record.getDesignId());
        vo.setAuthNo(record.getAuthNo());
        vo.setDesignTitle(record.getDesignTitle());
        vo.setCoverUrl(record.getCoverUrl());
        vo.setAuthType(record.getAuthType());
        vo.setAuthTypeLabel(record.getAuthTypeLabel());
        vo.setLicenseHolder(record.getLicenseHolder());
        vo.setLicenseNo(record.getLicenseNo());
        vo.setSizeLabel(formatSize(record.getWidth(), record.getHeight()));
        vo.setAuthTime(formatDateTime(record.getAuthTime()));
        vo.setCertVersion(record.getCertVersion() != null ? record.getCertVersion() : 1);
        vo.setLatestCert(true);
        return vo;
    }

    private AuthRecordCertFile buildCertFile(DesignAuthRecord record) {
        AuthRecordCertFile file = new AuthRecordCertFile();
        file.setId(record.getId());
        file.setAuthNo(record.getAuthNo());
        file.setFileName(record.getAuthNo() + "-授权书.html");
        file.setContentType("text/html;charset=utf-8");
        file.setContent(buildCertHtml(record));
        return file;
    }

    private String buildCertHtml(DesignAuthRecord record) {
        return """
            <!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>商用授权书</title>
            <style>body{font-family:Arial,sans-serif;padding:40px;color:#1b2337;line-height:1.8}
            h1{text-align:center;font-size:24px;margin-bottom:32px}
            .row{display:flex;margin:8px 0}.label{width:120px;color:#8693ab}.value{flex:1}
            .footer{margin-top:48px;text-align:right;color:#505a71}</style></head><body>
            <h1>设计作品商用授权书</h1>
            <div class="row"><span class="label">授权编号</span><span class="value">%s</span></div>
            <div class="row"><span class="label">作品名称</span><span class="value">%s</span></div>
            <div class="row"><span class="label">授权类型</span><span class="value">%s</span></div>
            <div class="row"><span class="label">被授权方</span><span class="value">%s</span></div>
            <div class="row"><span class="label">证件号码</span><span class="value">%s</span></div>
            <div class="row"><span class="label">作品尺寸</span><span class="value">%s</span></div>
            <div class="row"><span class="label">授权时间</span><span class="value">%s</span></div>
            <p>本授权书证明上述设计作品已通过灵图工坊平台完成正版商用授权，授权方可在授权范围内进行商业使用。</p>
            <div class="footer">灵图工坊 · 正版商用授权<br/>%s</div></body></html>
            """.formatted(
            esc(record.getAuthNo()),
            esc(record.getDesignTitle()),
            esc(record.getAuthTypeLabel()),
            esc(record.getLicenseHolder()),
            esc(record.getLicenseNo()),
            esc(formatSize(record.getWidth(), record.getHeight())),
            esc(formatDateTime(record.getAuthTime())),
            esc(formatDateTime(record.getAuthTime()))
        );
    }

    private List<DesignAuthRecord> pickLatestByDesign(List<DesignAuthRecord> records) {
        Map<Long, DesignAuthRecord> latest = new LinkedHashMap<>();
        for (DesignAuthRecord record : records) {
            latest.putIfAbsent(record.getDesignId(), record);
        }
        return new ArrayList<>(latest.values());
    }

    private String resolveAuthTypeLabel(Integer memberLevel) {
        if (memberLevel != null && memberLevel >= 2) {
            return "企业商用授权";
        }
        return "个人/企业商用授权";
    }

    private String resolveLicenseHolder(SysUser user) {
        if (StringUtils.hasText(user.getNickname())) {
            return user.getNickname();
        }
        if (StringUtils.hasText(user.getPhone())) {
            return maskPhone(user.getPhone());
        }
        return user.getUsername();
    }

    private String maskPhone(String phone) {
        if (phone.length() < 7) return phone;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    private String formatSize(Integer width, Integer height) {
        if (width == null || height == null) return "-";
        return width + " × " + height + " px";
    }

    private String formatDateTime(LocalDateTime time) {
        return time == null ? "" : time.format(DATE_TIME);
    }

    private LocalDateTime parseStart(String date) {
        if (!StringUtils.hasText(date)) return null;
        return LocalDate.parse(date.trim(), DATE).atStartOfDay();
    }

    private LocalDateTime parseEnd(String date) {
        if (!StringUtils.hasText(date)) return null;
        return LocalDate.parse(date.trim(), DATE).atTime(23, 59, 59);
    }

    private String esc(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private void SecurityUtilsRequire(Long userId) {
        if (userId == null) {
            throw new BusinessException(401, "请先登录");
        }
    }
}
