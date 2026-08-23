package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.entity.MemberPlan;
import com.chuangkit.admin.mapper.MemberPlanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberPlanMapper memberPlanMapper;

    /** 开通会员下拉菜单 — 按单人/团队分组返回 */
    public List<Map<String, Object>> listPlanGroups() {
        List<MemberPlan> plans = memberPlanMapper.selectList(
            new LambdaQueryWrapper<MemberPlan>()
                .eq(MemberPlan::getStatus, 1)
                .orderByAsc(MemberPlan::getGroupCode)
                .orderByAsc(MemberPlan::getSortOrder));

        LinkedHashMap<String, Map<String, Object>> groups = new LinkedHashMap<>();
        for (MemberPlan plan : plans) {
            groups.computeIfAbsent(plan.getGroupCode(), code -> {
                Map<String, Object> g = new LinkedHashMap<>();
                g.put("code", plan.getGroupCode());
                g.put("title", plan.getGroupTitle());
                g.put("subtitle", plan.getGroupSubtitle());
                g.put("plans", new ArrayList<Map<String, Object>>());
                return g;
            });
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> list = (List<Map<String, Object>>) groups.get(plan.getGroupCode()).get("plans");
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", plan.getId());
            item.put("name", plan.getName());
            item.put("description", plan.getDescription());
            item.put("iconStyle", plan.getIconStyle());
            item.put("linkUrl", plan.getLinkUrl());
            list.add(item);
        }
        return new ArrayList<>(groups.values());
    }
}
