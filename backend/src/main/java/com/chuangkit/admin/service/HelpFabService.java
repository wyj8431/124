package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.dto.HelpFabIndexDto;
import com.chuangkit.admin.entity.HelpFabMenuItem;
import com.chuangkit.admin.entity.TeamIntroConfig;
import com.chuangkit.admin.mapper.HelpFabMenuItemMapper;
import com.chuangkit.admin.mapper.TeamIntroConfigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HelpFabService {

    private final HelpFabMenuItemMapper menuItemMapper;
    private final TeamIntroConfigMapper teamIntroConfigMapper;

    public HelpFabIndexDto getIndex() {
        HelpFabIndexDto dto = new HelpFabIndexDto();

        List<HelpFabMenuItem> items = menuItemMapper.selectList(
            new LambdaQueryWrapper<HelpFabMenuItem>()
                .eq(HelpFabMenuItem::getStatus, 1)
                .orderByAsc(HelpFabMenuItem::getSortOrder));

        for (HelpFabMenuItem item : items) {
            HelpFabIndexDto.MenuItem menuItem = new HelpFabIndexDto.MenuItem();
            menuItem.setId(item.getId());
            menuItem.setName(item.getName());
            menuItem.setCode(item.getCode());
            menuItem.setIcon(item.getIcon());
            menuItem.setLinkUrl(item.getLinkUrl());
            menuItem.setLinkTarget(item.getLinkTarget());
            dto.getItems().add(menuItem);
        }

        TeamIntroConfig config = teamIntroConfigMapper.selectById(1L);
        if (config != null) {
            HelpFabIndexDto.CustomerService cs = new HelpFabIndexDto.CustomerService();
            cs.setTitle(config.getConsultantTitle());
            cs.setSubtitle(config.getConsultantSubtitle());
            cs.setQrCodeUrl(config.getConsultantQrUrl());
            cs.setAvatarUrl(config.getConsultantAvatarUrl());
            dto.setCustomerService(cs);
        }

        return dto;
    }
}
