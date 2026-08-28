package com.chuangkit.admin.service;

import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.DesignCreateRequest;
import com.chuangkit.admin.dto.DesignSaveRequest;
import com.chuangkit.admin.entity.UserDesign;
import com.chuangkit.admin.mapper.DesignSceneMapper;
import com.chuangkit.admin.mapper.DesignTemplateMapper;
import com.chuangkit.admin.mapper.UserDesignMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
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

    @Test
    void createsAnEditableCopyWhenAnOfficialTemplateIsNotInTheLocalCatalog() {
        DesignCreateRequest request = new DesignCreateRequest();
        request.setTemplateId(583048L);
        request.setTemplateTitle("兴趣班开学季招生宣传海报");
        request.setTemplateCoverUrl("https://example.com/template.png");
        request.setTitle("兴趣班开学季招生宣传海报");
        request.setWidth(1242);
        request.setHeight(2208);
        when(templateMapper.selectById(583048L)).thenReturn(null);

        designService.create(7L, request);

        ArgumentCaptor<UserDesign> saved = ArgumentCaptor.forClass(UserDesign.class);
        verify(designMapper).insert(saved.capture());
        verify(usageQuotaService).consume(7L, "create");
        verify(userRecentService, never()).record(7L, "template", 583048L);
        assertEquals("兴趣班开学季招生宣传海报", saved.getValue().getTitle());
        assertEquals("https://example.com/template.png", saved.getValue().getCoverUrl());
        assertEquals(1242, saved.getValue().getWidth());
        assertEquals(2208, saved.getValue().getHeight());
        assertFalse(saved.getValue().getCanvasJson().contains("null"));
        assertTrue(saved.getValue().getCanvasJson().contains("\"layers\":[{"));
        assertTrue(saved.getValue().getCanvasJson().contains("\"type\":\"image\""));
        assertTrue(saved.getValue().getCanvasJson().contains("\"src\":\"https://example.com/template.png\""));
    }
}
