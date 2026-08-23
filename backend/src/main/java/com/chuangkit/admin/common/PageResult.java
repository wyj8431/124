package com.chuangkit.admin.common;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.Data;

import java.util.List;

@Data
public class PageResult<T> {

    private List<T> list;
    private long total;
    private long page;
    private long pageSize;
    private long totalPages;

    public static <T> PageResult<T> of(Page<T> page) {
        PageResult<T> r = new PageResult<>();
        r.list = page.getRecords();
        r.total = page.getTotal();
        r.page = page.getCurrent();
        r.pageSize = page.getSize();
        r.totalPages = page.getPages();
        return r;
    }

    public static <S, T> PageResult<T> of(Page<S> page, List<T> list) {
        PageResult<T> r = new PageResult<>();
        r.list = list;
        r.total = page.getTotal();
        r.page = page.getCurrent();
        r.pageSize = page.getSize();
        r.totalPages = page.getPages();
        return r;
    }
}
