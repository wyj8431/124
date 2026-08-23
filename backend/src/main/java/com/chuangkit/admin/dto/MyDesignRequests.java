package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.List;

public final class MyDesignRequests {

    private MyDesignRequests() {}

    @Data
    public static class Rename {
        private String title;
    }

    @Data
    public static class Move {
        private Long folderId;
    }

    @Data
    public static class Folder {
        private String name;
    }

    @Data
    public static class Batch {
        private List<Long> ids;
    }
}
