package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.common.PageResult;
import com.chuangkit.admin.dto.MyDesignItemVo;
import com.chuangkit.admin.dto.MyFavoriteItemVo;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyDesignService {

    private final MyDesignNavMapper navMapper;
    private final UserDesignMapper designMapper;
    private final UserDesignFolderMapper folderMapper;
    private final DesignSceneMapper sceneMapper;
    private final DesignTemplateMapper templateMapper;
    private final TemplateLikeMapper likeMapper;

    /** 我的设计页聚合配置 — 对标官网 dam-page/my/list */
    public Map<String, Object> getIndex(Long userId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("navItems", listNavItems());
        data.put("typeTabs", listTypeTabs());
        data.put("sortOptions", listSortOptions());
        data.put("viewModes", List.of(
            Map.of("code", "grid", "name", "网格"),
            Map.of("code", "list", "name", "列表")
        ));
        data.put("folders", listFolders(userId));
        data.put("storage", buildStorageInfo(userId));
        data.put("defaultView", "grid");
        data.put("defaultSort", "update_time");
        data.put("defaultTypeTab", "all");
        return data;
    }

    public List<MyDesignNav> listNavItems() {
        return navMapper.selectList(
            new LambdaQueryWrapper<MyDesignNav>()
                .eq(MyDesignNav::getStatus, 1)
                .orderByAsc(MyDesignNav::getSortOrder));
    }

    private List<Map<String, String>> listTypeTabs() {
        return List.of(
            Map.of("code", "all", "name", "全部"),
            Map.of("code", "poster", "name", "海报"),
            Map.of("code", "long", "name", "长图"),
            Map.of("code", "ppt", "name", "PPT"),
            Map.of("code", "h5", "name", "H5")
        );
    }

    private List<Map<String, String>> listSortOptions() {
        return List.of(
            Map.of("code", "update_time", "name", "最近修改"),
            Map.of("code", "create_time", "name", "最近创建"),
            Map.of("code", "title", "name", "名称")
        );
    }

    public List<UserDesignFolder> listFolders(Long userId) {
        return folderMapper.selectList(
            new LambdaQueryWrapper<UserDesignFolder>()
                .eq(UserDesignFolder::getUserId, userId)
                .eq(UserDesignFolder::getStatus, 1)
                .orderByAsc(UserDesignFolder::getSortOrder)
                .orderByDesc(UserDesignFolder::getUpdateTime));
    }

    private Map<String, Object> buildStorageInfo(Long userId) {
        long count = designMapper.selectCount(
            new LambdaQueryWrapper<UserDesign>().eq(UserDesign::getUserId, userId));
        return Map.of(
            "usedCount", count,
            "totalCount", 500,
            "label", count + " / 500"
        );
    }

    /** 设计列表 — 支持关键词、排序、类型、文件夹筛选 */
    public PageResult<MyDesignItemVo> listDesigns(
            Long userId,
            int page,
            int pageSize,
            String keyword,
            String sort,
            String typeTab,
            Long folderId,
            String viewMode) {

        LambdaQueryWrapper<UserDesign> qw = new LambdaQueryWrapper<UserDesign>()
            .eq(UserDesign::getUserId, userId);

        if (folderId != null) {
            if (folderId == 0L) {
                qw.isNull(UserDesign::getFolderId);
            } else {
                qw.eq(UserDesign::getFolderId, folderId);
            }
        }

        if (StringUtils.hasText(keyword)) {
            String q = keyword.trim();
            qw.like(UserDesign::getTitle, q);
        }

        applyTypeFilter(qw, typeTab);
        applySort(qw, sort);

        Page<UserDesign> p = designMapper.selectPage(new Page<>(page, pageSize), qw);
        return PageResult.of(p, toDesignVos(p.getRecords()));
    }

    /** 回收站列表 */
    public PageResult<MyDesignItemVo> listRecycle(Long userId, int page, int pageSize, String keyword) {
        List<UserDesign> all = designMapper.selectRecycleBin(userId);
        if (StringUtils.hasText(keyword)) {
            String q = keyword.trim().toLowerCase();
            all = all.stream()
                .filter(d -> d.getTitle() != null && d.getTitle().toLowerCase().contains(q))
                .toList();
        }
        return paginateVos(all, page, pageSize);
    }

    /** 收藏模板列表 */
    public PageResult<MyFavoriteItemVo> listFavorites(Long userId, int page, int pageSize, String keyword) {
        List<TemplateLike> likes = likeMapper.selectList(
            new LambdaQueryWrapper<TemplateLike>()
                .eq(TemplateLike::getUserId, userId)
                .orderByDesc(TemplateLike::getCreateTime));

        if (likes.isEmpty()) {
            return emptyPage(page, pageSize);
        }

        List<Long> templateIds = likes.stream().map(TemplateLike::getTemplateId).toList();
        Map<Long, DesignTemplate> templateMap = templateMapper.selectList(
            new LambdaQueryWrapper<DesignTemplate>()
                .in(DesignTemplate::getId, templateIds)
                .eq(DesignTemplate::getStatus, 1))
            .stream().collect(Collectors.toMap(DesignTemplate::getId, t -> t, (a, b) -> a));

        List<MyFavoriteItemVo> items = likes.stream()
            .map(like -> {
                DesignTemplate t = templateMap.get(like.getTemplateId());
                if (t == null) return null;
                if (StringUtils.hasText(keyword)) {
                    String q = keyword.trim().toLowerCase();
                    if (!t.getTitle().toLowerCase().contains(q)) return null;
                }
                MyFavoriteItemVo vo = new MyFavoriteItemVo();
                vo.setId(like.getId());
                vo.setTemplateId(t.getId());
                vo.setTitle(t.getTitle());
                vo.setCoverUrl(t.getCoverUrl());
                vo.setWidth(t.getWidth());
                vo.setHeight(t.getHeight());
                vo.setIsFree(t.getIsFree());
                vo.setLikeTime(like.getCreateTime());
                return vo;
            })
            .filter(Objects::nonNull)
            .toList();

        return paginateFavorites(items, page, pageSize);
    }

    public MyDesignItemVo rename(Long id, Long userId, String title) {
        UserDesign design = requireDesign(id, userId);
        if (!StringUtils.hasText(title)) throw new BusinessException("标题不能为空");
        design.setTitle(title.trim());
        designMapper.updateById(design);
        return toDesignVo(design);
    }

    public MyDesignItemVo move(Long id, Long userId, Long folderId) {
        UserDesign design = requireDesign(id, userId);
        if (folderId != null && folderId > 0) {
            requireFolder(folderId, userId);
        }
        design.setFolderId(folderId != null && folderId > 0 ? folderId : null);
        designMapper.updateById(design);
        return toDesignVo(design);
    }

    public void deleteToRecycle(Long id, Long userId) {
        UserDesign design = requireDesign(id, userId);
        designMapper.deleteById(design.getId());
    }

    public MyDesignItemVo restore(Long id, Long userId) {
        int rows = designMapper.restoreFromRecycle(id, userId);
        if (rows == 0) throw new BusinessException("设计不存在或无法恢复");
        UserDesign design = designMapper.selectById(id);
        return toDesignVo(design);
    }

    public void permanentDelete(Long id, Long userId) {
        int rows = designMapper.permanentDelete(id, userId);
        if (rows == 0) throw new BusinessException("设计不存在或无法删除");
    }

    public UserDesignFolder createFolder(Long userId, String name) {
        if (!StringUtils.hasText(name)) throw new BusinessException("文件夹名称不能为空");
        UserDesignFolder folder = new UserDesignFolder();
        folder.setUserId(userId);
        folder.setName(name.trim());
        folder.setSortOrder(0);
        folder.setStatus(1);
        folderMapper.insert(folder);
        return folder;
    }

    public UserDesignFolder renameFolder(Long id, Long userId, String name) {
        UserDesignFolder folder = requireFolder(id, userId);
        if (!StringUtils.hasText(name)) throw new BusinessException("文件夹名称不能为空");
        folder.setName(name.trim());
        folderMapper.updateById(folder);
        return folder;
    }

    public void deleteFolder(Long id, Long userId) {
        UserDesignFolder folder = requireFolder(id, userId);
        designMapper.update(null,
            new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<UserDesign>()
                .eq(UserDesign::getFolderId, id)
                .set(UserDesign::getFolderId, null));
        folderMapper.deleteById(folder.getId());
    }

    public void unlikeTemplate(Long userId, Long templateId) {
        likeMapper.delete(
            new LambdaQueryWrapper<TemplateLike>()
                .eq(TemplateLike::getUserId, userId)
                .eq(TemplateLike::getTemplateId, templateId));
    }

    private UserDesign requireDesign(Long id, Long userId) {
        UserDesign design = designMapper.selectById(id);
        if (design == null) throw new BusinessException("设计不存在");
        if (!design.getUserId().equals(userId)) throw new BusinessException(403, "无权访问");
        return design;
    }

    private UserDesignFolder requireFolder(Long id, Long userId) {
        UserDesignFolder folder = folderMapper.selectById(id);
        if (folder == null) throw new BusinessException("文件夹不存在");
        if (!folder.getUserId().equals(userId)) throw new BusinessException(403, "无权访问");
        return folder;
    }

    private void applySort(LambdaQueryWrapper<UserDesign> qw, String sort) {
        switch (sort != null ? sort : "update_time") {
            case "create_time" -> qw.orderByDesc(UserDesign::getCreateTime);
            case "title" -> qw.orderByAsc(UserDesign::getTitle);
            default -> qw.orderByDesc(UserDesign::getUpdateTime);
        }
    }

    private void applyTypeFilter(LambdaQueryWrapper<UserDesign> qw, String typeTab) {
        if (!StringUtils.hasText(typeTab) || "all".equals(typeTab)) return;

        List<Long> sceneIds = sceneMapper.selectList(
            new LambdaQueryWrapper<DesignScene>().eq(DesignScene::getStatus, 1))
            .stream()
            .filter(s -> matchesTypeTab(s, typeTab))
            .map(DesignScene::getId)
            .toList();

        if (sceneIds.isEmpty()) {
            qw.eq(UserDesign::getId, -1L);
        } else {
            qw.in(UserDesign::getSceneId, sceneIds);
        }
    }

    private boolean matchesTypeTab(DesignScene scene, String typeTab) {
        String code = scene.getCode() != null ? scene.getCode().toLowerCase() : "";
        String category = scene.getCategory() != null ? scene.getCategory().toLowerCase() : "";
        String name = scene.getName() != null ? scene.getName().toLowerCase() : "";
        return switch (typeTab) {
            case "poster" -> code.contains("poster") || name.contains("海报") || category.contains("poster");
            case "long" -> code.contains("long") || name.contains("长图") || (scene.getHeight() != null && scene.getWidth() != null && scene.getHeight() > scene.getWidth() * 1.5);
            case "ppt" -> code.contains("ppt") || name.contains("ppt") || category.contains("ppt");
            case "h5" -> code.contains("h5") || name.contains("h5");
            default -> true;
        };
    }

    private List<MyDesignItemVo> toDesignVos(List<UserDesign> designs) {
        if (designs.isEmpty()) return List.of();

        Set<Long> sceneIds = designs.stream()
            .map(UserDesign::getSceneId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        Map<Long, DesignScene> sceneMap = sceneIds.isEmpty() ? Map.of()
            : sceneMapper.selectBatchIds(sceneIds).stream()
                .collect(Collectors.toMap(DesignScene::getId, s -> s, (a, b) -> a));

        return designs.stream().map(d -> {
            MyDesignItemVo vo = new MyDesignItemVo();
            BeanUtils.copyProperties(d, vo);
            DesignScene scene = d.getSceneId() != null ? sceneMap.get(d.getSceneId()) : null;
            if (scene != null) {
                vo.setSceneName(scene.getName());
                vo.setTypeLabel(resolveTypeLabel(scene));
            } else {
                vo.setTypeLabel("设计");
            }
            return vo;
        }).toList();
    }

    private MyDesignItemVo toDesignVo(UserDesign design) {
        return toDesignVos(List.of(design)).get(0);
    }

    private String resolveTypeLabel(DesignScene scene) {
        String name = scene.getName() != null ? scene.getName() : "";
        if (name.contains("长图")) return "长图";
        if (name.contains("PPT") || name.contains("ppt")) return "PPT";
        if (name.contains("H5") || name.contains("h5")) return "H5";
        if (name.contains("海报")) return "海报";
        return "设计";
    }

    private <T> PageResult<T> emptyPage(int page, int pageSize) {
        PageResult<T> result = new PageResult<>();
        result.setList(List.of());
        result.setTotal(0);
        result.setPage(page);
        result.setPageSize(pageSize);
        result.setTotalPages(0);
        return result;
    }

    private PageResult<MyDesignItemVo> paginateVos(List<UserDesign> all, int page, int pageSize) {
        List<MyDesignItemVo> vos = toDesignVos(all);
        return paginateItems(vos, page, pageSize);
    }

    private PageResult<MyFavoriteItemVo> paginateFavorites(List<MyFavoriteItemVo> items, int page, int pageSize) {
        return paginateItems(items, page, pageSize);
    }

    private <T> PageResult<T> paginateItems(List<T> items, int page, int pageSize) {
        int total = items.size();
        int from = Math.max(0, (page - 1) * pageSize);
        int to = Math.min(total, from + pageSize);
        List<T> slice = from >= total ? List.of() : items.subList(from, to);

        PageResult<T> result = new PageResult<>();
        result.setList(slice);
        result.setTotal(total);
        result.setPage(page);
        result.setPageSize(pageSize);
        result.setTotalPages(pageSize > 0 ? (int) Math.ceil((double) total / pageSize) : 0);
        return result;
    }
}
