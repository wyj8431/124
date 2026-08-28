-- 工单编号：网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单
-- 生产环境由发布人员人工审核后执行；脚本仅新增表和索引，不修改既有数据。
CREATE TABLE IF NOT EXISTS design_share_link (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    design_id       BIGINT NOT NULL,
    created_by      BIGINT NOT NULL,
    token           VARCHAR(128) NOT NULL UNIQUE,
    mode            VARCHAR(16) NOT NULL DEFAULT 'readonly' COMMENT 'readonly/editable',
    expire_time     DATETIME,
    revoked         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_design_share_link_design ON design_share_link(design_id, revoked);
