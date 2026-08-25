package com.chuangkit.admin.service;

import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.DesignSaveRequest;
import com.chuangkit.admin.entity.UserDesign;
import com.chuangkit.admin.mapper.DesignSceneMapper;
import com.chuangkit.admin.mapper.DesignTemplateMapper;
import com.chuangkit.admin.mapper.UserDesignMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DesignServiceTest {

    @Mock
    private UserDesignMapper designMapper;
    @Mock
    private DesignTemplateMapper templateMapper;
    @Mock
    private DesignSceneMapper sceneMapper;
    @Mock
    private UserRecentService userRecentService;
    @Mock
    private UsageQuotaService usageQuotaService;

    @InjectMocks
    private DesignService designService;

    @Test
    void rejectsSavingWithStaleRevisionBeforeConsumingQuota() {
        UserDesign current = new UserDesign();
        current.setId(42L);
        current.setUserId(7L);
        current.setRevision(8L);
        when(designMapper.selectById(42L)).thenReturn(current);

        DesignSaveRequest request = new DesignSaveRequest();
        request.setRevision(7L);
        request.setCanvasJson("{}");

        BusinessException error = assertThrows(BusinessException.class,
            () -> designService.save(42L, 7L, request));

        assertEquals(409, error.getCode());
        verify(usageQuotaService, never()).consume(7L, "save");
    }
}
