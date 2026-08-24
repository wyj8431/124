-- ============================================================
-- 创客贴低代码平台 - 数据库表结构
-- 对应官网: https://www.chuangkit.com/designtools/designindex
-- ============================================================

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(64)  NOT NULL UNIQUE,
    password        VARCHAR(128) NOT NULL,
    nickname        VARCHAR(64),
    avatar          VARCHAR(512),
    phone           VARCHAR(20),
    email           VARCHAR(128),
    system_role     VARCHAR(32) DEFAULT 'user' COMMENT 'user/admin/operator',
    member_level    TINYINT DEFAULT 0 COMMENT '0免费 1VIP 2团队版',
    member_expire   DATETIME,
    status          TINYINT DEFAULT 1 COMMENT '1正常 0禁用',
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE sys_user ADD COLUMN IF NOT EXISTS system_role VARCHAR(32) DEFAULT 'user';

CREATE UNIQUE INDEX IF NOT EXISTS uk_sys_user_phone ON sys_user(phone);

-- 免费用户每日创建、保存、导出额度；会员用户不受此表限制
CREATE TABLE IF NOT EXISTS user_usage_daily (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    usage_date      DATE NOT NULL,
    create_count    INT DEFAULT 0,
    save_count      INT DEFAULT 0,
    export_count    INT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_usage_daily UNIQUE (user_id, usage_date)
);

CREATE INDEX idx_user_usage_daily_user_date ON user_usage_daily(user_id, usage_date);

-- 设计场景/尺寸（海报、小红书、PPT 等）
CREATE TABLE IF NOT EXISTS design_scene (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64)  NOT NULL,
    code            VARCHAR(64)  NOT NULL UNIQUE,
    icon            VARCHAR(512),
    subtitle        VARCHAR(128),
    preview_url     VARCHAR(512),
    width           INT,
    height          INT,
    unit            VARCHAR(16) DEFAULT 'px',
    category        VARCHAR(64),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 模板分类
CREATE TABLE IF NOT EXISTS template_category (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64)  NOT NULL,
    code            VARCHAR(64)  NOT NULL UNIQUE,
    parent_id       BIGINT DEFAULT 0,
    icon            VARCHAR(512),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 设计模板
CREATE TABLE IF NOT EXISTS design_template (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(256) NOT NULL,
    cover_url       VARCHAR(512) NOT NULL,
    preview_url     VARCHAR(512),
    scene_id        BIGINT,
    category_id     BIGINT,
    width           INT,
    height          INT,
    canvas_json     CLOB COMMENT '模板画布 JSON（图层、文字、图片等）',
    tags            VARCHAR(512),
    use_count       INT DEFAULT 0,
    is_free         TINYINT DEFAULT 1 COMMENT '1免费 0会员',
    is_hot          TINYINT DEFAULT 0,
    is_recommend    TINYINT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户设计作品（画布数据存后端，非静态）
CREATE TABLE IF NOT EXISTS user_design (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    title           VARCHAR(256) DEFAULT '未命名设计',
    cover_url       VARCHAR(512),
    scene_id        BIGINT,
    template_id     BIGINT COMMENT '基于哪个模板创建，空白则为空',
    folder_id       BIGINT COMMENT '所属文件夹',
    canvas_json     CLOB NOT NULL COMMENT '用户编辑后的画布 JSON',
    width           INT,
    height          INT,
    status          TINYINT DEFAULT 1 COMMENT '1草稿 2已完成',
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 素材库（图片/字体/贴纸）
CREATE TABLE IF NOT EXISTS material (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(128) NOT NULL,
    type            VARCHAR(32)  NOT NULL COMMENT 'image/font/sticker/icon',
    url             VARCHAR(512) NOT NULL,
    thumbnail       VARCHAR(512),
    category        VARCHAR(64),
    tags            VARCHAR(512),
    is_free         TINYINT DEFAULT 1,
    use_count       INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI 工具配置
CREATE TABLE IF NOT EXISTS ai_tool (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64)  NOT NULL,
    code            VARCHAR(64)  NOT NULL UNIQUE,
    description     VARCHAR(256),
    icon            VARCHAR(512),
    cover_url       VARCHAR(512),
    category        VARCHAR(64) COMMENT 'hot/ai_ecommerce/video/image_process',
    api_endpoint    VARCHAR(256) COMMENT '内部 AI 服务地址',
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI 任务记录
CREATE TABLE IF NOT EXISTS ai_task (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    tool_id         BIGINT NOT NULL,
    input_params    CLOB,
    output_url      VARCHAR(512),
    status          TINYINT DEFAULT 0 COMMENT '0处理中 1成功 2失败',
    error_msg       VARCHAR(512),
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    finish_time     DATETIME
);

-- 可配置 AI Provider（密钥仅由后端环境变量注入）
CREATE TABLE IF NOT EXISTS ai_provider (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(128) NOT NULL,
    code            VARCHAR(64) NOT NULL UNIQUE,
    endpoint        VARCHAR(512),
    api_key_env     VARCHAR(128),
    model           VARCHAR(128),
    enabled         TINYINT DEFAULT 1,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 客服工单
CREATE TABLE IF NOT EXISTS support_ticket (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    subject         VARCHAR(256) NOT NULL,
    content         VARCHAR(4000) NOT NULL,
    priority        VARCHAR(16) DEFAULT 'normal',
    status          VARCHAR(32) DEFAULT 'open' COMMENT 'open/pending/resolved/closed',
    assignee_id     BIGINT,
    last_reply      VARCHAR(2000),
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_support_ticket_user_status ON support_ticket(user_id, status);

-- 设备告警
CREATE TABLE IF NOT EXISTS device_alert (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    device_id       VARCHAR(128) NOT NULL,
    alert_type      VARCHAR(64) NOT NULL,
    severity        VARCHAR(16) DEFAULT 'warning',
    message         VARCHAR(1000) NOT NULL,
    status          VARCHAR(32) DEFAULT 'open' COMMENT 'open/acknowledged/resolved',
    occurred_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at     DATETIME,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_device_alert_user_status ON device_alert(user_id, status);

-- 首页功能卡片（热门推荐、AI电商等 Tab 下的卡片）
CREATE TABLE IF NOT EXISTS home_feature (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(64)  NOT NULL,
    subtitle        VARCHAR(128),
    cover_url       VARCHAR(512),
    link_type       VARCHAR(32) COMMENT 'scene/ai_tool/template_category/url',
    link_value      VARCHAR(256),
    tab_code        VARCHAR(64) DEFAULT 'hot' COMMENT 'hot/ai_ecommerce/model_wear/video/pod/image_process/print',
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 热搜标签
CREATE TABLE IF NOT EXISTS hot_tag (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    emoji           VARCHAR(16),
    search_keyword  VARCHAR(128),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 热点日历事件
CREATE TABLE IF NOT EXISTS calendar_event (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64)  NOT NULL,
    event_date      DATE NOT NULL,
    description     VARCHAR(256),
    category_code   VARCHAR(64) DEFAULT 'traditional',
    cover_url       VARCHAR(512),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 热点日历分类筛选
CREATE TABLE IF NOT EXISTS calendar_category (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64)  NOT NULL,
    code            VARCHAR(64)  NOT NULL UNIQUE,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 日历事件-模板关联（上方节日卡片与下方瀑布流一一对应）
CREATE TABLE IF NOT EXISTS calendar_event_template (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id        BIGINT NOT NULL,
    template_id     BIGINT NOT NULL,
    sort_order      INT DEFAULT 0,
    CONSTRAINT uk_calendar_event_template UNIQUE (event_id, template_id)
);

-- 编辑精选合集
CREATE TABLE IF NOT EXISTS editor_collection (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(64)  NOT NULL,
    subtitle        VARCHAR(128),
    cover_url       VARCHAR(512),
    cover_url_hover VARCHAR(512),
    category_code   VARCHAR(64) COMMENT '关联模板分类 code，点击跳转筛选',
    template_count  INT DEFAULT 0,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 合集-模板关联
CREATE TABLE IF NOT EXISTS collection_template (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    collection_id   BIGINT NOT NULL,
    template_id     BIGINT NOT NULL,
    sort_order      INT DEFAULT 0
);

-- 首页内容区块（喜报、招聘等专题）
CREATE TABLE IF NOT EXISTS home_section (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(64)  NOT NULL,
    subtitle        VARCHAR(256),
    code            VARCHAR(64)  NOT NULL UNIQUE,
    category_id     BIGINT COMMENT '关联模板分类',
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 首页专题卡片（喜报等横向滚动区）
CREATE TABLE IF NOT EXISTS home_section_card (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    section_code    VARCHAR(64)  NOT NULL,
    label           VARCHAR(64)  NOT NULL COMMENT '卡片底部标签，如销冠喜报',
    template_id     BIGINT NOT NULL,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_home_section_card_code ON home_section_card(section_code);

-- 首页 Tab 配置
CREATE TABLE IF NOT EXISTS home_tab (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    code            VARCHAR(64) NOT NULL UNIQUE,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0
);

-- 搜索 Tab（设计模板/Agent/图片生成/视频生成）
CREATE TABLE IF NOT EXISTS search_tab (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    code            VARCHAR(64) NOT NULL UNIQUE,
    placeholder     VARCHAR(256),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1
);

-- 用户最近使用记录
CREATE TABLE IF NOT EXISTS user_recent (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    target_type     VARCHAR(32) NOT NULL COMMENT 'scene/template/ai_tool/design',
    target_id       BIGINT NOT NULL,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 团队
CREATE TABLE IF NOT EXISTS team (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(128) NOT NULL,
    owner_id        BIGINT NOT NULL,
    member_count    INT DEFAULT 1,
    max_members     INT DEFAULT 20,
    version_type    VARCHAR(32) DEFAULT 'free' COMMENT 'free/vip/flagship',
    version_label   VARCHAR(64) DEFAULT '免费团队',
    storage_used_bytes BIGINT DEFAULT 0,
    storage_total_bytes BIGINT DEFAULT 3221225472 COMMENT '3G',
    points_balance  INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_member (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id         BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    role            VARCHAR(32) DEFAULT 'member' COMMENT 'owner/admin/member',
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_team_member UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_member_user ON team_member(user_id);
CREATE INDEX idx_team_owner ON team(owner_id);

-- 团队协作邀请
CREATE TABLE IF NOT EXISTS team_invitation (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id         BIGINT NOT NULL,
    inviter_id      BIGINT NOT NULL,
    invitee_id      BIGINT,
    invitee_email   VARCHAR(128),
    token           VARCHAR(128) NOT NULL UNIQUE,
    role            VARCHAR(32) DEFAULT 'member' COMMENT 'admin/member',
    status          VARCHAR(32) DEFAULT 'pending' COMMENT 'pending/accepted/rejected/expired',
    expire_time     DATETIME,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_team_invitation_team ON team_invitation(team_id, status);
CREATE INDEX idx_team_invitation_invitee ON team_invitation(invitee_id, status);

-- 设计评论
CREATE TABLE IF NOT EXISTS team_comment (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id         BIGINT NOT NULL,
    design_id       BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    content         VARCHAR(2000) NOT NULL,
    parent_id       BIGINT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_team_comment_design ON team_comment(design_id, create_time);

-- 设计版本快照
CREATE TABLE IF NOT EXISTS team_design_version (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id         BIGINT NOT NULL,
    design_id       BIGINT NOT NULL,
    version_no      INT NOT NULL,
    user_id         BIGINT NOT NULL,
    canvas_json     CLOB NOT NULL,
    note            VARCHAR(256),
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_team_design_version UNIQUE (design_id, version_no)
);

CREATE INDEX idx_team_design_version_design ON team_design_version(design_id, version_no);

-- 团队协作在线状态
CREATE TABLE IF NOT EXISTS team_presence (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id         BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    status          VARCHAR(32) DEFAULT 'online' COMMENT 'online/away/offline',
    last_seen       DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_team_presence UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_presence_team ON team_presence(team_id, status);

-- 企业/团队管理侧栏导航
CREATE TABLE IF NOT EXISTS enterprise_nav (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id       BIGINT DEFAULT 0,
    name            VARCHAR(64) NOT NULL,
    code            VARCHAR(64) NOT NULL,
    route_path      VARCHAR(256),
    badge_text      VARCHAR(32),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_enterprise_nav_parent ON enterprise_nav(parent_id);

-- 企业账户概览快捷入口
CREATE TABLE IF NOT EXISTS enterprise_quick_access (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    code            VARCHAR(64) NOT NULL,
    description     VARCHAR(256),
    icon            VARCHAR(32),
    route_path      VARCHAR(256),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 会员方案（开通会员下拉菜单）
CREATE TABLE IF NOT EXISTS member_plan (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_code      VARCHAR(32)  NOT NULL COMMENT 'individual/team',
    group_title     VARCHAR(64)  NOT NULL,
    group_subtitle  VARCHAR(128),
    name            VARCHAR(64)  NOT NULL,
    description     VARCHAR(256),
    icon_style      VARCHAR(32)  DEFAULT 'blue' COMMENT 'blue/orange/enterprise',
    link_url        VARCHAR(256),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_plan_group ON member_plan(group_code);

-- 会员弹窗：版本档位
CREATE TABLE IF NOT EXISTS member_tier (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_code      VARCHAR(32) NOT NULL COMMENT 'individual/team',
    code            VARCHAR(32) NOT NULL,
    name            VARCHAR(64) NOT NULL,
    description     VARCHAR(512),
    min_seats       INT DEFAULT 1,
    max_seats       INT DEFAULT 1,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 会员弹窗：订阅 SKU
CREATE TABLE IF NOT EXISTS member_sku (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    tier_id         BIGINT NOT NULL,
    name            VARCHAR(64) NOT NULL,
    price_cents     INT NOT NULL,
    original_price_cents INT,
    badge_text      VARCHAR(64),
    footer_text     VARCHAR(128),
    per_month_text  VARCHAR(128),
    duration_months INT NOT NULL DEFAULT 1,
    is_auto_renew   TINYINT DEFAULT 0,
    auto_renew_tip  VARCHAR(256),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_sku_tier ON member_sku(tier_id);

-- 会员弹窗：权益
CREATE TABLE IF NOT EXISTS member_benefit (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    tier_id         BIGINT NOT NULL,
    title           VARCHAR(128) NOT NULL,
    description     VARCHAR(256),
    icon            VARCHAR(32),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_benefit_tier ON member_benefit(tier_id);

-- 会员订单
CREATE TABLE IF NOT EXISTS member_order (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no        VARCHAR(64) NOT NULL,
    user_id         BIGINT NOT NULL,
    sku_id          BIGINT NOT NULL,
    seat_count      INT DEFAULT 1,
    total_price_cents INT NOT NULL,
    original_price_cents INT,
    pay_method      VARCHAR(16) DEFAULT 'alipay',
    status          VARCHAR(16) DEFAULT 'pending' COMMENT 'pending/paid/cancelled',
    valid_until     DATE,
    qr_payload      VARCHAR(512),
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    pay_time        DATETIME
);

CREATE UNIQUE INDEX uk_member_order_no ON member_order(order_no);
CREATE INDEX idx_member_order_user ON member_order(user_id);

CREATE INDEX idx_template_scene ON design_template(scene_id);
CREATE INDEX idx_user_design_user ON user_design(user_id);
CREATE INDEX idx_material_type ON material(type);
CREATE INDEX idx_home_feature_tab ON home_feature(tab_code);
CREATE INDEX idx_calendar_date ON calendar_event(event_date);
CREATE INDEX idx_calendar_event_template_event ON calendar_event_template(event_id);

-- 模板点赞
CREATE TABLE IF NOT EXISTS template_like (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    template_id     BIGINT NOT NULL,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_template_like UNIQUE (user_id, template_id)
);

-- 模板中心左侧导航
CREATE TABLE IF NOT EXISTS template_center_nav (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64)  NOT NULL,
    code            VARCHAR(64)  NOT NULL UNIQUE,
    icon            VARCHAR(512),
    link_type       VARCHAR(32)  DEFAULT 'category' COMMENT 'category/all/material/team/favorite',
    link_value      VARCHAR(64),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 模板中心筛选项分组（分类/场景/行业）
CREATE TABLE IF NOT EXISTS template_filter_group (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(32)  NOT NULL,
    code            VARCHAR(32)  NOT NULL UNIQUE,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1
);

-- 模板中心筛选项
CREATE TABLE IF NOT EXISTS template_filter_option (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_code      VARCHAR(32)  NOT NULL,
    name            VARCHAR(64)  NOT NULL,
    code            VARCHAR(64)  NOT NULL,
    match_type      VARCHAR(32)  DEFAULT 'all' COMMENT 'all/scene_code/scene_id/category_code/tag/scene_category',
    match_value     VARCHAR(128),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    CONSTRAINT uk_template_filter_option UNIQUE (group_code, code)
);

CREATE INDEX idx_template_filter_option_group ON template_filter_option(group_code);

-- 模板中心下拉筛选（颜色/用途/风格等）
CREATE TABLE IF NOT EXISTS template_extra_filter (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(32)  NOT NULL,
    code            VARCHAR(32)  NOT NULL UNIQUE,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS template_extra_filter_option (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    filter_code     VARCHAR(32)  NOT NULL,
    name            VARCHAR(64)  NOT NULL,
    code            VARCHAR(64)  NOT NULL,
    color_hex       VARCHAR(16),
    match_type      VARCHAR(32)  DEFAULT 'tag' COMMENT 'tag/is_free/all',
    match_value     VARCHAR(128),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    CONSTRAINT uk_template_extra_filter_option UNIQUE (filter_code, code)
);

CREATE INDEX idx_template_extra_filter_option_code ON template_extra_filter_option(filter_code);

-- 创建设计弹窗：左侧场景导航
CREATE TABLE IF NOT EXISTS create_design_nav (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64)  NOT NULL,
    code            VARCHAR(64)  NOT NULL UNIQUE,
    icon            VARCHAR(512),
    parent_code     VARCHAR(64)  DEFAULT 'scene',
    match_type      VARCHAR(32)  DEFAULT 'all' COMMENT 'all/scene_category/scene_code/tag',
    match_value     VARCHAR(128),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建设计弹窗：尺寸 Tab（常用/收藏/PC端/移动端/印刷）
CREATE TABLE IF NOT EXISTS create_design_size_tab (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(32)  NOT NULL,
    code            VARCHAR(32)  NOT NULL UNIQUE,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1
);

-- 创建设计弹窗：场景与导航/Tab 关联
CREATE TABLE IF NOT EXISTS create_design_scene_rel (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nav_code        VARCHAR(64)  NOT NULL,
    scene_id        BIGINT NOT NULL,
    size_tab_code   VARCHAR(32)  DEFAULT 'common',
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    CONSTRAINT uk_create_design_scene_rel UNIQUE (nav_code, scene_id, size_tab_code)
);

CREATE INDEX idx_create_design_scene_rel_nav ON create_design_scene_rel(nav_code, size_tab_code);

-- 我的设计页左侧导航（对标官网 dam-page/my）
CREATE TABLE IF NOT EXISTS my_design_nav (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64)  NOT NULL,
    code            VARCHAR(64)  NOT NULL UNIQUE,
    icon            VARCHAR(512),
    route_path      VARCHAR(128),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户设计文件夹
CREATE TABLE IF NOT EXISTS user_design_folder (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    name            VARCHAR(128) NOT NULL,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_design_folder_user ON user_design_folder(user_id);
CREATE INDEX idx_user_design_folder ON user_design(folder_id);

-- 团队介绍页（对标官网 designtools/designIntroPage）
CREATE TABLE IF NOT EXISTS team_intro_config (
    id                      BIGINT PRIMARY KEY,
    hero_title              VARCHAR(256) NOT NULL,
    hero_subtitle           VARCHAR(512),
    hero_cta_text           VARCHAR(64),
    team_nav_badge          VARCHAR(32),
    consultant_title        VARCHAR(64),
    consultant_subtitle     VARCHAR(128),
    consultant_qr_url       VARCHAR(512),
    consultant_avatar_url   VARCHAR(512),
    consultant_cta_text     VARCHAR(64),
    update_time             DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_intro_feature (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(64)  NOT NULL UNIQUE,
    title           VARCHAR(128) NOT NULL,
    subtitle        VARCHAR(256),
    image_url       VARCHAR(512),
    layout          VARCHAR(16)  DEFAULT 'text-left' COMMENT 'text-left | text-right',
    cta_text        VARCHAR(64),
    bullets         CLOB,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 团队升级弹窗（免费升级团队版）
CREATE TABLE IF NOT EXISTS team_upgrade_config (
    id              BIGINT PRIMARY KEY,
    form_title      VARCHAR(128) NOT NULL,
    left_title      VARCHAR(128),
    left_tags       CLOB,
    left_collage    CLOB COMMENT 'JSON: collage thumbnail urls',
    left_features   CLOB COMMENT 'JSON: [{title, subtitle}]',
    size_label      VARCHAR(64),
    cta_text        VARCHAR(64),
    cta_badge       VARCHAR(64),
    personal_label  VARCHAR(32),
    team_label      VARCHAR(32),
    redirect_path   VARCHAR(256),
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_upgrade_size_option (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(32)  NOT NULL UNIQUE,
    label           VARCHAR(64)  NOT NULL,
    max_members     INT DEFAULT 20,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1
);

-- 订单/发票中心
CREATE TABLE IF NOT EXISTS print_order (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no        VARCHAR(64) NOT NULL,
    user_id         BIGINT NOT NULL,
    product_name    VARCHAR(128) NOT NULL,
    quantity        INT DEFAULT 1,
    total_price_cents INT NOT NULL,
    status          VARCHAR(16) DEFAULT 'pending' COMMENT 'pending/paid/cancelled/completed',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    pay_time        DATETIME
);
CREATE INDEX idx_print_order_user ON print_order(user_id);

CREATE TABLE IF NOT EXISTS user_invoice (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_no      VARCHAR(64) NOT NULL,
    user_id         BIGINT NOT NULL,
    invoice_type    VARCHAR(16) NOT NULL COMMENT 'personal/enterprise',
    title           VARCHAR(128) NOT NULL,
    tax_no          VARCHAR(64),
    email           VARCHAR(128) NOT NULL,
    remark          VARCHAR(256),
    amount_cents    INT NOT NULL,
    status          VARCHAR(16) DEFAULT 'issued' COMMENT 'pending/issued',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    issue_time      DATETIME
);
CREATE UNIQUE INDEX uk_user_invoice_no ON user_invoice(invoice_no);
CREATE INDEX idx_user_invoice_user ON user_invoice(user_id);

CREATE TABLE IF NOT EXISTS user_invoice_item (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id      BIGINT NOT NULL,
    order_id        BIGINT NOT NULL,
    order_no        VARCHAR(64),
    product_name    VARCHAR(128),
    amount_cents    INT NOT NULL
);
CREATE INDEX idx_user_invoice_item_invoice ON user_invoice_item(invoice_id);
CREATE INDEX idx_user_invoice_item_order ON user_invoice_item(order_id);

CREATE TABLE IF NOT EXISTS corporate_transfer (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    transfer_no     VARCHAR(64) NOT NULL,
    user_id         BIGINT NOT NULL,
    amount_cents    INT NOT NULL,
    payer_name      VARCHAR(128),
    remark          VARCHAR(256),
    status          VARCHAR(16) DEFAULT 'pending' COMMENT 'pending/confirmed/rejected',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirm_time    DATETIME
);
CREATE INDEX idx_corporate_transfer_user ON corporate_transfer(user_id);

CREATE TABLE IF NOT EXISTS user_wallet (
    user_id         BIGINT PRIMARY KEY,
    balance_cents   INT DEFAULT 0,
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_balance_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    change_cents    INT NOT NULL,
    balance_after_cents INT NOT NULL,
    biz_type        VARCHAR(32) NOT NULL COMMENT 'recharge/consume/refund/transfer',
    title           VARCHAR(128) NOT NULL,
    remark          VARCHAR(256),
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_balance_log_user ON user_balance_log(user_id);

-- 设计授权记录
CREATE TABLE IF NOT EXISTS design_auth_record (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    design_id       BIGINT NOT NULL,
    auth_no         VARCHAR(64) NOT NULL,
    design_title    VARCHAR(256),
    cover_url       VARCHAR(512),
    auth_type       VARCHAR(32) DEFAULT 'commercial',
    auth_type_label VARCHAR(64),
    license_holder  VARCHAR(128),
    license_no      VARCHAR(64),
    width           INT,
    height          INT,
    auth_time       DATETIME NOT NULL,
    cert_version    INT DEFAULT 1,
    status          TINYINT DEFAULT 1,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uk_design_auth_no ON design_auth_record(auth_no);
CREATE INDEX idx_design_auth_user ON design_auth_record(user_id);
CREATE INDEX idx_design_auth_design ON design_auth_record(design_id);

-- 用户消息中心
CREATE TABLE IF NOT EXISTS user_message (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    category        VARCHAR(32) DEFAULT 'system' COMMENT 'system activity order',
    title           VARCHAR(256) NOT NULL,
    summary         VARCHAR(512),
    content         CLOB,
    link_url        VARCHAR(512),
    link_text       VARCHAR(64),
    is_read         TINYINT DEFAULT 0 COMMENT '0未读 1已读',
    status          TINYINT DEFAULT 1,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_time       DATETIME
);
CREATE INDEX idx_user_message_user ON user_message(user_id);
CREATE INDEX idx_user_message_read ON user_message(user_id, is_read);

-- 用户优惠券
CREATE TABLE IF NOT EXISTS user_coupon (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    title           VARCHAR(128) NOT NULL,
    coupon_code     VARCHAR(64),
    discount_type   VARCHAR(16) DEFAULT 'amount' COMMENT 'amount percent',
    discount_value  INT NOT NULL COMMENT 'amount in cents or percent value',
    min_amount      INT DEFAULT 0 COMMENT 'minimum order amount in cents',
    scope_label     VARCHAR(128),
    status          TINYINT DEFAULT 0 COMMENT '0未使用 1已使用 2已过期',
    expire_time     DATETIME NOT NULL,
    used_time       DATETIME,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_coupon_user ON user_coupon(user_id);
CREATE INDEX idx_user_coupon_status ON user_coupon(user_id, status);

-- 意见反馈
CREATE TABLE IF NOT EXISTS feedback_config (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    page_title              VARCHAR(128) NOT NULL,
    intro_text              TEXT,
    type_question_label     VARCHAR(256),
    feedback_content_label  VARCHAR(256),
    feedback_content_desc   VARCHAR(512),
    feedback_content_placeholder VARCHAR(256),
    contact_question_label  TEXT,
    submit_button_text      VARCHAR(32) DEFAULT '提交',
    success_title           VARCHAR(256),
    success_subtitle        VARCHAR(512),
    reward_title            VARCHAR(256),
    reward_subtitle         VARCHAR(256),
    claim_button_text       VARCHAR(32) DEFAULT '去领取',
    claim_link_url          VARCHAR(512),
    home_button_text        VARCHAR(32) DEFAULT '返回首页',
    home_link_url           VARCHAR(512) DEFAULT '/',
    header_image_url        VARCHAR(512),
    status                  TINYINT DEFAULT 1,
    deleted                 TINYINT DEFAULT 0,
    create_time             DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback_type_option (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(64) NOT NULL,
    label           VARCHAR(256) NOT NULL,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_feedback (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT,
    feedback_type_code  VARCHAR(64) NOT NULL,
    feedback_content    TEXT,
    contact_info        VARCHAR(512),
    create_time         DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_feedback_user ON user_feedback(user_id);

-- 右下角帮助悬浮菜单
CREATE TABLE IF NOT EXISTS help_fab_menu (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    code            VARCHAR(64) NOT NULL,
    icon            VARCHAR(32),
    link_url        VARCHAR(512),
    link_target     VARCHAR(16) DEFAULT '_blank' COMMENT '_blank/_self/action',
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI 专题页（对标官网 /designtools/aitopic/aishipin）
CREATE TABLE IF NOT EXISTS ai_topic_page (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    code                    VARCHAR(64) NOT NULL UNIQUE,
    title                   VARCHAR(128) NOT NULL,
    breadcrumb_parent       VARCHAR(64),
    breadcrumb_parent_url   VARCHAR(256),
    prompt_placeholder      VARCHAR(256),
    generate_button_text    VARCHAR(32) DEFAULT '生成视频',
    status                  TINYINT DEFAULT 1,
    deleted                 TINYINT DEFAULT 0,
    create_time             DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_topic_preset (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    page_code       VARCHAR(64) NOT NULL,
    title           VARCHAR(64) NOT NULL,
    cover_url       VARCHAR(512),
    prompt_text     TEXT,
    card_rotate_deg INT DEFAULT 0,
    card_offset_x   INT DEFAULT 0,
    card_z_index    INT DEFAULT 1,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_topic_section (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    page_code       VARCHAR(64) NOT NULL,
    title           VARCHAR(64) NOT NULL,
    emoji           VARCHAR(16),
    more_text       VARCHAR(32) DEFAULT '更多',
    more_link       VARCHAR(256),
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_topic_inspiration (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    section_id      BIGINT NOT NULL,
    title           VARCHAR(64) NOT NULL,
    cover_url       VARCHAR(512),
    cover_hover_url VARCHAR(1024),
    prompt_text     TEXT,
    sort_order      INT DEFAULT 0,
    status          TINYINT DEFAULT 1,
    deleted         TINYINT DEFAULT 0,
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_topic_preset_page ON ai_topic_preset(page_code);
CREATE INDEX idx_ai_topic_section_page ON ai_topic_section(page_code);
CREATE INDEX idx_ai_topic_inspiration_section ON ai_topic_inspiration(section_id);
