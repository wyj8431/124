package com.chuangkit.admin.service;

import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.DesignShareCreateRequest;
import com.chuangkit.admin.entity.DesignShareLink;
import com.chuangkit.admin.entity.UserDesign;
import com.chuangkit.admin.mapper.DesignShareLinkMapper;
import com.chuangkit.admin.mapper.UserDesignMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DesignShareServiceTest {
    @Mock private DesignShareLinkMapper shareLinkMapper;
    @Mock private UserDesignMapper designMapper;
    @InjectMocks private DesignShareService shareService;

    @Test
    void rejectsUnknownShareMode() {
        UserDesign design = new UserDesign();
        design.setId(42L);
        design.setUserId(7L);
        when(designMapper.selectById(42L)).thenReturn(design);
        DesignShareCreateRequest request = new DesignShareCreateRequest();
        request.setMode("public");

        BusinessException error = assertThrows(BusinessException.class, () -> shareService.create(42L, 7L, request));
        assertEquals(400, error.getCode());
    }

    @Test
    void rejectsRevokedShareToken() {
        DesignShareLink link = new DesignShareLink();
        link.setToken("revoked-token");
        link.setRevoked(1);
        when(shareLinkMapper.selectOne(any())).thenReturn(link);

        BusinessException error = assertThrows(BusinessException.class, () -> shareService.resolve("revoked-token"));
        assertEquals(404, error.getCode());
    }

    @Test
    void resolvesActiveShareWithModeAndDesignContent() {
        DesignShareLink link = new DesignShareLink();
        link.setToken("editable-token");
        link.setDesignId(42L);
        link.setMode("editable");
        link.setRevoked(0);
        UserDesign design = new UserDesign();
        design.setId(42L);
        design.setTitle("协作海报");
        design.setCanvasJson("{}");
        when(shareLinkMapper.selectOne(any())).thenReturn(link);
        when(designMapper.selectById(42L)).thenReturn(design);

        var access = shareService.resolve("editable-token");
        assertEquals("editable", access.getMode());
        assertEquals("协作海报", access.getTitle());
    }
}
