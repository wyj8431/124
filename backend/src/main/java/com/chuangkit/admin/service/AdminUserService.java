package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.AdminUserDto;
import com.chuangkit.admin.dto.AdminUserUpdateRequest;
import com.chuangkit.admin.entity.SysUser;
import com.chuangkit.admin.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final SysUserMapper userMapper;

    public List<AdminUserDto> listUsers() {
        return userMapper.selectList(new LambdaQueryWrapper<SysUser>().orderByDesc(SysUser::getCreateTime))
            .stream().map(this::toDto).toList();
    }

    public AdminUserDto updateUser(Long id, AdminUserUpdateRequest request) {
        if (!List.of("user", "admin", "operator").contains(request.getSystemRole())) {
            throw new BusinessException("不支持的系统角色");
        }
        SysUser user = userMapper.selectById(id);
        if (user == null) throw new BusinessException("用户不存在");
        user.setSystemRole(request.getSystemRole());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        userMapper.updateById(user);
        return toDto(user);
    }

    private AdminUserDto toDto(SysUser user) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setNickname(user.getNickname());
        dto.setPhone(user.getPhone());
        dto.setSystemRole(user.getSystemRole() == null ? "user" : user.getSystemRole());
        dto.setMemberLevel(user.getMemberLevel());
        dto.setStatus(user.getStatus());
        dto.setCreateTime(user.getCreateTime());
        return dto;
    }
}
