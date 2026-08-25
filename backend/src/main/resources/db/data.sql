-- ============================================================
-- 创客贴 - 初始化演示数据（对应官网首页内容）
-- 密码均为 123456 (BCrypt)
-- ============================================================

-- 启动时先清空演示数据，避免 H2 持久化库重复插入导致首页异常
DELETE FROM help_fab_menu;
DELETE FROM ai_topic_inspiration;
DELETE FROM ai_topic_section;
DELETE FROM ai_topic_preset;
DELETE FROM ai_topic_page;
DELETE FROM user_feedback;
DELETE FROM feedback_type_option;
DELETE FROM feedback_config;
DELETE FROM enterprise_quick_access;
DELETE FROM enterprise_nav;
DELETE FROM team_member;
DELETE FROM team;
DELETE FROM user_recent;
DELETE FROM template_like;
DELETE FROM calendar_event_template;
DELETE FROM collection_template;
DELETE FROM home_section_card;
DELETE FROM user_coupon;
DELETE FROM user_message;
DELETE FROM design_auth_record;
DELETE FROM user_design;
DELETE FROM design_template;
DELETE FROM calendar_event;
DELETE FROM home_feature;
DELETE FROM hot_tag;
DELETE FROM search_tab;
DELETE FROM home_tab;
DELETE FROM editor_collection;
DELETE FROM home_section;
DELETE FROM template_category;
DELETE FROM design_scene;
DELETE FROM ai_tool;
DELETE FROM member_order;
DELETE FROM member_benefit;
DELETE FROM member_sku;
DELETE FROM member_tier;
DELETE FROM member_plan;
DELETE FROM calendar_category;
DELETE FROM template_extra_filter_option;
DELETE FROM template_extra_filter;
DELETE FROM template_filter_option;
DELETE FROM template_filter_group;
DELETE FROM template_center_nav;
DELETE FROM create_design_scene_rel;
DELETE FROM create_design_size_tab;
DELETE FROM create_design_nav;
DELETE FROM user_design_folder;
DELETE FROM my_design_nav;
DELETE FROM sys_user WHERE id IN (1, 2);

INSERT INTO sys_user (id, username, password, nickname, avatar, phone, system_role, member_level, status) VALUES
(1, 'demo', '$2a$10$hhIZZOn3J85Rf3UW3b9z3uaMEo5RmUIiuUt.xsgS.DeWPBwAomlaO', '演示用户', 'https://static.chuangkit.com/avatar/default.png', '15512342987', 'user', 1, 1),
(2, 'admin', '$2a$10$hhIZZOn3J85Rf3UW3b9z3uaMEo5RmUIiuUt.xsgS.DeWPBwAomlaO', '管理员', 'https://static.chuangkit.com/avatar/default.png', '13800138000', 'admin', 2, 1);

INSERT INTO search_tab (name, code, placeholder, sort_order) VALUES
('设计模板', 'template', '输入关键词搜索你想要的模板或素材', 1),
('Agent模式', 'agent', '上传参考图片，描述下您想要的内容，我们会为您呈现...', 2),
('图片生成', 'image_gen', '上传参考图片，描述下您想要的内容，我们会为您呈现...', 3),
('视频生成', 'video_gen', '上传参考图片，描述下您想要的内容，我们会为您呈现...', 4);

INSERT INTO home_tab (name, code, sort_order) VALUES
('热门推荐', 'hot', 1),
('AI电商', 'ai_ecommerce', 2),
('模特穿戴', 'model_wear', 3),
('视频创作', 'video', 4),
('POD印花', 'pod', 5),
('图片处理', 'image_process', 6),
('印刷制作', 'print', 7);

INSERT INTO hot_tag (name, emoji, search_keyword, sort_order) VALUES
('七夕', '💞', '七夕', 1),
('邀请函', '🤝', '邀请函', 2),
('小红书', '📕', '小红书', 3),
('无限画布', NULL, '无限画布', 4),
('AI电商', NULL, 'AI电商', 5),
('喜报', NULL, '喜报', 6),
('展架·次日达', '✨', '展架', 7),
('3D打印手办', NULL, '3D打印', 8);

INSERT INTO design_scene (name, code, icon, subtitle, preview_url, width, height, category, sort_order) VALUES
('创建设计', 'create', '/icons/create.png', '高频创作场景一键直达', 'https://picsum.photos/seed/scene-create/240/160', 800, 600, 'general', 1),
('无限画布', 'infinite_canvas', '/icons/canvas.png', '点击即可快速开始', 'https://picsum.photos/seed/scene-canvas/240/160', 1920, 1080, 'general', 2),
('图片编辑', 'image_edit', '/icons/edit.png', '点击即可快速开始', 'https://picsum.photos/seed/scene-edit/240/160', 800, 800, 'general', 3),
('小红书配图', 'xiaohongshu', '/icons/xhs.png', NULL, NULL, 1242, 1660, 'social', 4),
('公众号首图', 'wechat_cover', '/icons/wechat.png', NULL, NULL, 900, 383, 'social', 5),
('全屏海报', 'fullscreen_poster', '/icons/poster.png', NULL, NULL, 1080, 1920, 'marketing', 6),
('PPT', 'ppt', '/icons/ppt.png', NULL, NULL, 1920, 1080, 'office', 7),
('名片印刷', 'business_card', '/icons/card.png', NULL, NULL, 1063, 709, 'print', 8),
('直播背景', 'live_bg', '/icons/live.png', NULL, NULL, 1920, 1080, 'live', 9),
('手机海报', 'mobile_poster', '/icons/mobile.png', NULL, NULL, 1080, 1920, 'marketing', 10),
('电商主图', 'product_main', '/icons/product.png', NULL, NULL, 800, 800, 'ecommerce', 11),
('长图海报', 'long_poster', '/icons/long.png', NULL, NULL, 800, 2000, 'marketing', 12),
('邀请函', 'invitation', '/icons/invite.png', NULL, NULL, 1080, 1920, 'marketing', 13),
('简历', 'resume', '/icons/resume.png', NULL, NULL, 595, 842, 'office', 14),
('LOGO', 'logo', '/icons/logo.png', NULL, NULL, 500, 500, 'brand', 15),
('横版海报', 'horizontal_poster', '/icons/h-poster.png', NULL, NULL, 1920, 1080, 'marketing', 16),
('视频封面', 'video_cover', '/icons/video.png', NULL, NULL, 1280, 720, 'video', 17),
('商品详情', 'product_detail', '/icons/detail.png', NULL, NULL, 790, 2000, 'ecommerce', 18),
('证书', 'certificate', '/icons/cert.png', NULL, NULL, 2480, 3508, 'office', 19),
('日签', 'daily_sign', '/icons/daily.png', NULL, NULL, 1080, 1920, 'social', 20);

INSERT INTO template_category (name, code, parent_id, sort_order) VALUES
('为你推荐', 'recommend', 0, 1),
('七夕', 'qixi', 0, 2),
('喜报', 'xibao', 0, 3),
('招聘', 'zhaopin', 0, 4),
('小红书', 'xiaohongshu', 0, 5),
('公众号首图', 'wechat', 0, 6),
('教育培训', 'education', 0, 7),
('长图海报', 'long_poster', 0, 8),
('全屏海报', 'fullscreen', 0, 9),
('邀请函', 'invitation', 0, 10),
('简历', 'resume', 0, 11),
('商品主图', 'product', 0, 12),
('PPT', 'ppt', 0, 13),
('LOGO', 'logo', 0, 14),
('处暑', 'chushu', 0, 15),
('秋日合集', 'autumn', 0, 16),
('早安', 'morning', 0, 17),
('名片印刷', 'business_card', 0, 18);

INSERT INTO ai_tool (name, code, description, icon, cover_url, category, sort_order) VALUES
('智能抠图', 'matting', '一键抠图', '/icons/ai/matting.png', 'https://picsum.photos/seed/ai-matting/160/120', 'hot', 1),
('AI爆款视频', 'ai_video', '一键生成带货视频', '/icons/ai/video.png', 'https://picsum.photos/seed/ai-video/160/120', 'hot', 2),
('AI海报/封面', 'ai_poster', '一键生成营销海报', '/icons/ai/poster.png', 'https://picsum.photos/seed/ai-poster/160/120', 'hot', 3),
('电商套图', 'ecommerce_set', '一键生成爆款套图', '/icons/ai/ecom.png', 'https://picsum.photos/seed/ai-ecom/160/120', 'ai_ecommerce', 4),
('AI去水印', 'remove_watermark', '无痕去水印', '/icons/ai/watermark.png', 'https://picsum.photos/seed/ai-watermark/160/120', 'image_process', 5),
('AI绘画', 'ai_draw', '文字生成图片', '/icons/ai/draw.png', 'https://picsum.photos/seed/ai-draw/160/120', 'hot', 6),
('AI文案', 'ai_copywriting', '智能写作好帮手', '/icons/ai/copy.png', 'https://picsum.photos/seed/ai-copy/160/120', 'hot', 7),
('图片变清晰', 'enhance', '模糊图片一键变清晰', '/icons/ai/enhance.png', 'https://picsum.photos/seed/ai-enhance/160/120', 'image_process', 8);

INSERT INTO home_feature (title, subtitle, cover_url, link_type, link_value, tab_code, sort_order) VALUES
('热点日历', '一览全年热点', 'https://picsum.photos/seed/feat-calendar/160/120', 'url', '/calendar', 'hot', 1),
('智能抠图', '一键抠图', 'https://picsum.photos/seed/feat-matting/160/120', 'ai_tool', 'matting', 'hot', 2),
('AI爆款视频', '一键生成带货视频', 'https://picsum.photos/seed/feat-video/160/120', 'ai_tool', 'ai_video', 'hot', 3),
('AI海报/封面', '一键生成营销海报', 'https://picsum.photos/seed/feat-poster/160/120', 'ai_tool', 'ai_poster', 'hot', 4),
('电商套图', '一键生成爆款套图', 'https://picsum.photos/seed/feat-ecom/160/120', 'ai_tool', 'ecommerce_set', 'hot', 5),
('AI去水印', '无痕去水印', 'https://picsum.photos/seed/feat-watermark/160/120', 'ai_tool', 'remove_watermark', 'hot', 6),
('印刷定制', '点击即可快速开始', 'https://picsum.photos/seed/feat-print/160/120', 'scene', 'business_card', 'print', 1),
('招生特辑', '全场景模板', 'https://picsum.photos/seed/feat-enroll/160/120', 'template_category', 'education', 'hot', 7),
('AI模特试穿', '一键生成穿搭效果', 'https://picsum.photos/seed/feat-model/160/120', 'ai_tool', 'matting', 'model_wear', 1),
('虚拟试衣间', '多场景穿搭展示', 'https://picsum.photos/seed/feat-tryon/160/120', 'ai_tool', 'ai_draw', 'model_wear', 2),
('穿搭海报', '一键生成穿搭海报', 'https://picsum.photos/seed/feat-outfit/160/120', 'ai_tool', 'ai_poster', 'model_wear', 3),
('短视频脚本', 'AI生成带货脚本', 'https://picsum.photos/seed/feat-script/160/120', 'ai_tool', 'ai_copywriting', 'video', 1),
('视频封面', '爆款封面一键生成', 'https://picsum.photos/seed/feat-vcover/160/120', 'ai_tool', 'ai_poster', 'video', 2),
('AI爆款视频', '一键生成带货视频', 'https://picsum.photos/seed/feat-vid2/160/120', 'ai_tool', 'ai_video', 'video', 3),
('POD印花设计', '定制印花图案', 'https://picsum.photos/seed/feat-pod1/160/120', 'ai_tool', 'ai_draw', 'pod', 1),
('T恤印花', '一键生成印花方案', 'https://picsum.photos/seed/feat-pod2/160/120', 'ai_tool', 'ai_poster', 'pod', 2),
('马克杯定制', '创意图案设计', 'https://picsum.photos/seed/feat-pod3/160/120', 'ai_tool', 'ecommerce_set', 'pod', 3),
('AI电商', '一键生成爆款套图', 'https://picsum.photos/seed/feat-aiecom/160/120', 'ai_tool', 'ecommerce_set', 'ai_ecommerce', 1),
('商品主图', '电商主图批量生成', 'https://picsum.photos/seed/feat-product/160/120', 'ai_tool', 'ai_poster', 'ai_ecommerce', 2),
('详情页设计', '详情页一键排版', 'https://picsum.photos/seed/feat-detail/160/120', 'ai_tool', 'ai_copywriting', 'ai_ecommerce', 3),
('图片变清晰', '模糊图片一键变清晰', 'https://picsum.photos/seed/feat-enhance/160/120', 'ai_tool', 'enhance', 'image_process', 1),
('AI去水印', '无痕去水印', 'https://picsum.photos/seed/feat-rmwm/160/120', 'ai_tool', 'remove_watermark', 'image_process', 2),
('智能抠图', '一键抠图', 'https://picsum.photos/seed/feat-mat2/160/120', 'ai_tool', 'matting', 'image_process', 3);

INSERT INTO calendar_category (name, code, sort_order) VALUES
('传统节日', 'traditional', 1),
('二十四节气', 'solar_terms', 2),
('现代节日', 'modern', 3),
('国际节日', 'international', 4),
('电商类节日', 'ecommerce', 5),
('纪念日', 'memorial', 6),
('营销节点', 'marketing', 7),
('节点', 'node', 8);

INSERT INTO calendar_event (name, event_date, description, category_code, sort_order) VALUES
('七夕', '2026-08-19', '中国传统情人节', 'traditional', 1),
('中国医师节', '2026-08-19', '致敬医务工作者', 'modern', 2),
('处暑', '2026-08-23', '二十四节气', 'solar_terms', 3),
('中元节', '2026-08-27', '传统节日', 'traditional', 4),
('九月你好', '2026-09-01', '新月问候', 'marketing', 5),
('开学季', '2026-09-01', '新学期开启', 'marketing', 6),
('教师节', '2026-09-10', '感恩教师', 'modern', 7),
('中秋节', '2026-09-25', '团圆佳节', 'traditional', 8),
('国庆节', '2026-10-01', '国庆黄金周', 'memorial', 9),
('双十一', '2026-11-11', '电商大促', 'ecommerce', 10),
('圣诞节', '2026-12-25', '国际节日', 'international', 11);

INSERT INTO editor_collection (title, subtitle, cover_url, cover_url_hover, category_code, template_count, sort_order) VALUES
('心动七夕', '2k+精美七夕物料', 'https://picsum.photos/seed/col-qixi1/200/280', 'https://picsum.photos/seed/col-qixi2/200/280', 'qixi', 2000, 1),
('处暑', '精美节气海报', 'https://picsum.photos/seed/col-chushu1/200/280', 'https://picsum.photos/seed/col-chushu2/200/280', 'fullscreen', 600, 2),
('开学季', '新学期 元气启程', 'https://picsum.photos/seed/col-school1/200/280', 'https://picsum.photos/seed/col-school2/200/280', 'education', 1500, 3),
('小红书', '爆款图文掌握流量', 'https://picsum.photos/seed/col-xhs1/200/280', 'https://picsum.photos/seed/col-xhs2/200/280', 'xiaohongshu', 3000, 4),
('早安日签', '每日一张开启全新一天', 'https://picsum.photos/seed/col-morning1/200/280', 'https://picsum.photos/seed/col-morning2/200/280', 'recommend', 500, 5),
('邀请函', '海量邀请函 活动必备', 'https://picsum.photos/seed/col-invite1/200/280', 'https://picsum.photos/seed/col-invite2/200/280', 'invitation', 1200, 6);

INSERT INTO home_section (title, subtitle, code, category_id, sort_order) VALUES
('喜报', '精美喜报合集，好设计配好业绩', 'xibao', 3, 1),
('招聘', 'HR必备！6k+招聘物料合集', 'zhaopin', 4, 2);

INSERT INTO design_template (title, cover_url, scene_id, category_id, width, height, canvas_json, tags, use_count, is_free, is_hot, is_recommend) VALUES
('简约手绘风心理知识科普小红书', 'https://picsum.photos/seed/t1/400/533', 4, 5, 1242, 1660, '{"version":"1.0","layers":[]}', '小红书,心理,科普', 1250, 1, 1, 1),
('绿色简约质感疗愈工作室小红书', 'https://picsum.photos/seed/t2/400/533', 4, 5, 1242, 1660, '{"version":"1.0","layers":[]}', '小红书,疗愈', 980, 1, 1, 1),
('简约风秋季养生主题小红书配图', 'https://picsum.photos/seed/t3/400/533', 4, 5, 1242, 1660, '{"version":"1.0","layers":[]}', '小红书,养生,秋季', 876, 1, 0, 1),
('疗愈工作室简约风小红书', 'https://picsum.photos/seed/t4/400/533', 4, 5, 1242, 1660, '{"version":"1.0","layers":[]}', '小红书,疗愈', 654, 1, 0, 1),
('招聘小红书', 'https://picsum.photos/seed/t5/400/533', 4, 4, 1242, 1660, '{"version":"1.0","layers":[]}', '招聘,小红书', 2100, 1, 1, 1),
('简约手绘新手装修经验分享小红书', 'https://picsum.photos/seed/t6/400/533', 4, 5, 1242, 1660, '{"version":"1.0","layers":[]}', '装修,小红书', 543, 1, 0, 0),
('中国风七夕主题海报', 'https://picsum.photos/seed/t7/400/533', 6, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,海报', 3200, 1, 1, 1),
('七夕情人节线上创意宣传海报', 'https://picsum.photos/seed/t8/400/533', 6, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,海报', 2800, 1, 1, 1),
('红色质感销售业绩喜报宣传手机海报', 'https://picsum.photos/seed/t9/400/533', 6, 3, 1080, 1920, '{"version":"1.0","layers":[]}', '喜报,业绩', 4500, 1, 1, 1),
('扁平插画风人才招聘手机海报', 'https://picsum.photos/seed/t10/400/533', 6, 4, 1080, 1920, '{"version":"1.0","layers":[]}', '招聘,海报', 3800, 1, 1, 1),
('渐变质感风招聘求职人才招聘公众号首图', 'https://picsum.photos/seed/t11/400/200', 5, 4, 900, 383, '{"version":"1.0","layers":[]}', '招聘,公众号', 2900, 1, 0, 1),
('创意时尚宠物店开业宣传长图海报', 'https://picsum.photos/seed/t12/400/800', 6, 8, 800, 2000, '{"version":"1.0","layers":[]}', '开业,长图', 1200, 1, 0, 0),
('浪漫七夕粉色渐变手机海报', 'https://picsum.photos/seed/t13/400/533', 6, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,浪漫', 1800, 1, 1, 1),
('国潮风七夕节日海报', 'https://picsum.photos/seed/t14/400/533', 6, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,国潮', 1600, 1, 1, 1),
('简约风处暑节气海报', 'https://picsum.photos/seed/t15/400/533', 6, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '处暑,节气', 900, 1, 0, 1),
('七夕鹊桥相会竖版海报', 'https://picsum.photos/seed/qixi-v1/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,海报', 2400, 1, 1, 1),
('七夕浪漫邀约长图', 'https://picsum.photos/seed/qixi-long/400/900', 12, 2, 800, 2000, '{"version":"1.0","layers":[]}', '七夕,长图', 1500, 1, 0, 1),
('七夕活动公众号首图', 'https://picsum.photos/seed/qixi-wx/400/170', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '七夕,公众号', 2100, 1, 1, 1),
('七夕横版促销海报', 'https://picsum.photos/seed/qixi-h/400/225', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '七夕,横版', 1300, 1, 0, 1),
('七夕小红书配图', 'https://picsum.photos/seed/qixi-xhs/400/533', 4, 5, 1242, 1660, '{"version":"1.0","layers":[]}', '七夕,小红书', 1900, 1, 1, 1),
('七夕方形朋友圈封面', 'https://picsum.photos/seed/qixi-sq/400/400', 6, 2, 1080, 1080, '{"version":"1.0","layers":[]}', '七夕,朋友圈', 1100, 1, 0, 1),
('开学季校园宣传海报', 'https://picsum.photos/seed/t16/400/533', 6, 7, 1080, 1920, '{"version":"1.0","layers":[]}', '开学,教育', 1100, 1, 0, 1),
('金色奖杯业绩喜报手机海报', 'https://picsum.photos/seed/t17/400/533', 6, 3, 1080, 1920, '{"version":"1.0","layers":[]}', '喜报,奖杯', 5200, 1, 1, 1),
('红色喜庆销售喜报', 'https://picsum.photos/seed/t18/400/533', 6, 3, 1080, 1920, '{"version":"1.0","layers":[]}', '喜报,销售', 4800, 1, 1, 1),
('科技风企业招聘海报', 'https://picsum.photos/seed/t19/400/533', 6, 4, 1080, 1920, '{"version":"1.0","layers":[]}', '招聘,科技', 3500, 1, 1, 1),
('校园招聘季宣传海报', 'https://picsum.photos/seed/t20/400/533', 6, 4, 1080, 1920, '{"version":"1.0","layers":[]}', '招聘,校园', 3200, 1, 0, 1),
('短视频带货封面模板', 'https://picsum.photos/seed/t21/400/225', 17, 6, 1280, 720, '{"version":"1.0","layers":[]}', '短视频,封面', 2800, 1, 1, 1),
('美食探店短视频封面', 'https://picsum.photos/seed/t22/400/225', 17, 6, 1280, 720, '{"version":"1.0","layers":[]}', '短视频,美食', 2400, 1, 0, 1),
('电商直播预告封面', 'https://picsum.photos/seed/t23/400/225', 17, 6, 1280, 720, '{"version":"1.0","layers":[]}', '直播,电商', 2100, 1, 1, 1),
('简约商务PPT封面', 'https://picsum.photos/seed/t24/400/225', 7, 13, 1920, 1080, '{"version":"1.0","layers":[]}', 'PPT,商务', 1900, 1, 0, 1),
('七夕星空浪漫手机海报', 'https://picsum.photos/seed/qixi-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,浪漫', 2650, 1, 1, 1),
('七夕粉色花瓣手机海报', 'https://picsum.photos/seed/qixi-mp-02/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,浪漫', 2480, 1, 1, 1),
('七夕鹊桥相会手机海报', 'https://picsum.photos/seed/qixi-mp-03/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,国潮', 2350, 1, 1, 1),
('七夕告白季手机海报', 'https://picsum.photos/seed/qixi-mp-04/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,告白', 2200, 1, 0, 1),
('七夕限定礼遇手机海报', 'https://picsum.photos/seed/qixi-mp-05/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,电商', 2100, 1, 1, 1),
('七夕古风插画手机海报', 'https://picsum.photos/seed/qixi-mp-06/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,插画', 1980, 1, 0, 1),
('七夕甜蜜约会手机海报', 'https://picsum.photos/seed/qixi-mp-07/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,约会', 1850, 1, 0, 1),
('七夕品牌活动手机海报', 'https://picsum.photos/seed/qixi-mp-08/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,活动', 1720, 1, 1, 1),
('七夕红色喜庆手机海报', 'https://picsum.photos/seed/qixi-mp-09/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,喜庆', 1650, 1, 1, 1),
('七夕简约线条手机海报', 'https://picsum.photos/seed/qixi-mp-10/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,简约', 1580, 1, 0, 1),
('七夕商场促销手机海报', 'https://picsum.photos/seed/qixi-mp-11/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '七夕,手机海报,促销', 1520, 1, 0, 1),
('七夕餐饮美食手机海报', 'https://picsum.photos/seed/qixi-mp-12/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '七夕,手机海报,美食', 1460, 1, 0, 1),
('七夕美妆护肤手机海报', 'https://picsum.photos/seed/qixi-mp-13/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,美妆', 1390, 1, 1, 1),
('七夕鲜花礼盒手机海报', 'https://picsum.photos/seed/qixi-mp-14/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,鲜花', 1320, 1, 0, 1),
('七夕影院约会手机海报', 'https://picsum.photos/seed/qixi-mp-15/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,电影', 1280, 1, 0, 1),
('七夕珠宝首饰手机海报', 'https://picsum.photos/seed/qixi-mp-16/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,珠宝', 1210, 1, 1, 1),
('七夕酒店度假手机海报', 'https://picsum.photos/seed/qixi-mp-17/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '七夕,手机海报,旅游', 1150, 1, 0, 1),
('七夕咖啡茶饮手机海报', 'https://picsum.photos/seed/qixi-mp-18/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '七夕,手机海报,饮品', 1080, 1, 0, 1),
('七夕烛光晚餐手机海报', 'https://picsum.photos/seed/qixi-mp-19/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,晚餐', 1020, 1, 0, 1),
('七夕巧克力礼盒手机海报', 'https://picsum.photos/seed/qixi-mp-20/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '七夕,手机海报,礼盒', 980, 1, 0, 1),
('七夕情侣写真手机海报', 'https://picsum.photos/seed/qixi-mp-21/400/780', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '七夕,手机海报,写真', 940, 1, 1, 1),
('七夕汉服国风手机海报', 'https://picsum.photos/seed/qixi-mp-22/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,汉服', 910, 1, 0, 1),
('七夕星空许愿手机海报', 'https://picsum.photos/seed/qixi-mp-23/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '七夕,手机海报,星空', 880, 1, 0, 1),
('七夕手工DIY手机海报', 'https://picsum.photos/seed/qixi-mp-24/400/660', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '七夕,手机海报,手工', 850, 1, 0, 1),
('七夕宠物萌宠手机海报', 'https://picsum.photos/seed/qixi-mp-25/400/740', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,萌宠', 820, 1, 0, 1),
('七夕瑜伽健身手机海报', 'https://picsum.photos/seed/qixi-mp-26/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '七夕,手机海报,健身', 790, 1, 0, 1),
('七夕书店文艺手机海报', 'https://picsum.photos/seed/qixi-mp-27/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,文艺', 760, 1, 0, 1),
('七夕烘焙甜品手机海报', 'https://picsum.photos/seed/qixi-mp-28/400/850', 10, 2, 1080, 2400, '{"version":"1.0","layers":[]}', '七夕,手机海报,甜品', 730, 1, 1, 1),
('七夕花店促销手机海报', 'https://picsum.photos/seed/qixi-mp-29/400/670', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '七夕,手机海报,花店', 700, 1, 0, 1),
('七夕婚纱礼服手机海报', 'https://picsum.photos/seed/qixi-mp-30/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,婚纱', 670, 1, 1, 1),
('七夕民宿打卡手机海报', 'https://picsum.photos/seed/qixi-mp-31/400/800', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '七夕,手机海报,民宿', 640, 1, 0, 1),
('七夕音乐live手机海报', 'https://picsum.photos/seed/qixi-mp-32/400/760', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,音乐', 610, 1, 0, 1),
('七夕护肤套装手机海报', 'https://picsum.photos/seed/qixi-mp-33/400/690', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '七夕,手机海报,护肤', 580, 1, 0, 1),
('七夕数码好物手机海报', 'https://picsum.photos/seed/qixi-mp-34/400/810', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '七夕,手机海报,数码', 550, 1, 0, 1),
('七夕亲子活动手机海报', 'https://picsum.photos/seed/qixi-mp-35/400/750', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '七夕,手机海报,亲子', 520, 1, 0, 1),
('七夕公众号活动首图', 'https://picsum.photos/seed/qixi-wx-02/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '七夕,公众号', 2000, 1, 0, 1),
('七夕浪漫邀约公众号首图', 'https://picsum.photos/seed/qixi-wx-03/400/172', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '七夕,公众号', 1850, 1, 0, 1),
('七夕甜蜜攻略小红书配图', 'https://picsum.photos/seed/qixi-xhs-02/400/534', 4, 5, 1242, 1660, '{"version":"1.0","layers":[]}', '七夕,小红书', 1750, 1, 0, 1),
('七夕约会指南小红书配图', 'https://picsum.photos/seed/qixi-xhs-03/400/535', 4, 5, 1242, 1660, '{"version":"1.0","layers":[]}', '七夕,小红书', 1620, 1, 0, 1),
('七夕礼遇清单长图海报', 'https://picsum.photos/seed/qixi-long-02/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '七夕,长图', 1400, 1, 0, 1),
('七夕商场横版促销海报', 'https://picsum.photos/seed/qixi-h-02/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '七夕,横版', 1250, 1, 0, 1),
('白衣天使致敬手机海报', 'https://picsum.photos/seed/doctor-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中国医师节,医师,手机海报', 2400, 1, 1, 1),
('医师节感恩贺卡手机海报', 'https://picsum.photos/seed/doctor-mp-02/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '中国医师节,医师,手机海报', 2383, 1, 1, 1),
('医院宣传手机海报', 'https://picsum.photos/seed/doctor-mp-03/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '中国医师节,医师,手机海报', 2366, 1, 1, 1),
('医者仁心主题手机海报', 'https://picsum.photos/seed/doctor-mp-04/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中国医师节,医师,手机海报', 2349, 1, 1, 1),
('医师节活动手机海报', 'https://picsum.photos/seed/doctor-mp-05/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '中国医师节,医师,手机海报', 2332, 1, 1, 1),
('健康科普手机海报', 'https://picsum.photos/seed/doctor-mp-06/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '中国医师节,医师,手机海报', 2315, 1, 1, 1),
('医师节义诊手机海报', 'https://picsum.photos/seed/doctor-mp-07/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中国医师节,医师,手机海报', 2298, 1, 1, 1),
('护士节联动手机海报', 'https://picsum.photos/seed/doctor-mp-08/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中国医师节,医师,手机海报', 2281, 1, 1, 1),
('医疗团队风采手机海报', 'https://picsum.photos/seed/doctor-mp-09/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '中国医师节,医师,手机海报', 2264, 1, 1, 1),
('医师节公众号首图', 'https://picsum.photos/seed/doctor-wx-01/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '中国医师节,医师,公众号', 2247, 1, 1, 1),
('致敬医者公众号首图', 'https://picsum.photos/seed/doctor-wx-02/400/172', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '中国医师节,医师,公众号', 2230, 1, 1, 1),
('医师节小红书配图', 'https://picsum.photos/seed/doctor-xhs-01/400/534', 4, 2, 1242, 1660, '{"version":"1.0","layers":[]}', '中国医师节,医师,小红书', 2213, 1, 1, 1),
('医师节竖版海报', 'https://picsum.photos/seed/doctor-v-01/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中国医师节,医师,手机海报', 2196, 1, 1, 1),
('医师节长图海报', 'https://picsum.photos/seed/doctor-long-01/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '中国医师节,医师,长图', 2179, 1, 1, 1),
('医师节横版海报', 'https://picsum.photos/seed/doctor-h-01/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '中国医师节,医师,横版', 2162, 1, 1, 1),
('处暑节气手机海报', 'https://picsum.photos/seed/chushu-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '处暑,处暑,手机海报', 2145, 1, 1, 1),
('处暑秋意手机海报', 'https://picsum.photos/seed/chushu-mp-02/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '处暑,处暑,手机海报', 2128, 1, 1, 1),
('处暑养生手机海报', 'https://picsum.photos/seed/chushu-mp-03/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '处暑,处暑,手机海报', 2111, 1, 1, 1),
('处暑插画手机海报', 'https://picsum.photos/seed/chushu-mp-04/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '处暑,处暑,手机海报', 2094, 1, 1, 1),
('处暑茶歇手机海报', 'https://picsum.photos/seed/chushu-mp-05/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '处暑,处暑,手机海报', 2077, 1, 1, 1),
('处暑旅游手机海报', 'https://picsum.photos/seed/chushu-mp-06/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '处暑,处暑,手机海报', 2060, 1, 1, 1),
('处暑美食手机海报', 'https://picsum.photos/seed/chushu-mp-07/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '处暑,处暑,手机海报', 2043, 1, 1, 1),
('处暑农事手机海报', 'https://picsum.photos/seed/chushu-mp-08/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '处暑,处暑,手机海报', 2026, 1, 1, 1),
('处暑公众号首图', 'https://picsum.photos/seed/chushu-wx-01/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '处暑,处暑,公众号', 2009, 1, 1, 1),
('处暑小红书配图', 'https://picsum.photos/seed/chushu-xhs-01/400/534', 4, 2, 1242, 1660, '{"version":"1.0","layers":[]}', '处暑,处暑,小红书', 1992, 1, 1, 1),
('处暑长图海报', 'https://picsum.photos/seed/chushu-long-01/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '处暑,处暑,长图', 1975, 1, 1, 1),
('处暑横版海报', 'https://picsum.photos/seed/chushu-h-01/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '处暑,处暑,横版', 1958, 1, 1, 1),
('处暑简约手机海报', 'https://picsum.photos/seed/chushu-mp-09/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '处暑,处暑,手机海报', 1941, 1, 1, 1),
('处暑国风手机海报', 'https://picsum.photos/seed/chushu-mp-10/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '处暑,处暑,手机海报', 1924, 1, 1, 1),
('中元节祭祀手机海报', 'https://picsum.photos/seed/zy-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中元节,中元,手机海报', 1907, 1, 1, 1),
('中元节传统手机海报', 'https://picsum.photos/seed/zy-mp-02/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '中元节,中元,手机海报', 1890, 1, 1, 1),
('中元节祈福手机海报', 'https://picsum.photos/seed/zy-mp-03/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '中元节,中元,手机海报', 1873, 1, 1, 1),
('中元节插画手机海报', 'https://picsum.photos/seed/zy-mp-04/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中元节,中元,手机海报', 1856, 1, 1, 1),
('中元节思念手机海报', 'https://picsum.photos/seed/zy-mp-05/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '中元节,中元,手机海报', 1839, 1, 1, 1),
('中元节国风手机海报', 'https://picsum.photos/seed/zy-mp-06/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '中元节,中元,手机海报', 1822, 1, 1, 1),
('中元节活动手机海报', 'https://picsum.photos/seed/zy-mp-07/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中元节,中元,手机海报', 1805, 1, 1, 1),
('中元节公众号首图', 'https://picsum.photos/seed/zy-wx-01/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '中元节,中元,公众号', 1788, 1, 1, 1),
('中元节小红书配图', 'https://picsum.photos/seed/zy-xhs-01/400/534', 4, 2, 1242, 1660, '{"version":"1.0","layers":[]}', '中元节,中元,小红书', 1771, 1, 1, 1),
('中元节竖版海报', 'https://picsum.photos/seed/zy-v-01/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中元节,中元,手机海报', 1754, 1, 1, 1),
('中元节长图海报', 'https://picsum.photos/seed/zy-long-01/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '中元节,中元,长图', 1737, 1, 1, 1),
('中元节横版海报', 'https://picsum.photos/seed/zy-h-01/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '中元节,中元,横版', 1720, 1, 1, 1),
('中元节简约手机海报', 'https://picsum.photos/seed/zy-mp-08/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中元节,中元,手机海报', 1703, 1, 1, 1),
('中元节民俗手机海报', 'https://picsum.photos/seed/zy-mp-09/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '中元节,中元,手机海报', 1686, 1, 1, 1),
('九月你好问候手机海报', 'https://picsum.photos/seed/sept-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '九月你好,九月,手机海报', 1669, 1, 1, 1),
('九月你好励志手机海报', 'https://picsum.photos/seed/sept-mp-02/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '九月你好,九月,手机海报', 1652, 1, 1, 1),
('九月你好早安手机海报', 'https://picsum.photos/seed/sept-mp-03/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '九月你好,九月,手机海报', 1635, 1, 1, 1),
('九月你好插画手机海报', 'https://picsum.photos/seed/sept-mp-04/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '九月你好,九月,手机海报', 1618, 1, 1, 1),
('九月你好日签手机海报', 'https://picsum.photos/seed/sept-mp-05/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '九月你好,九月,手机海报', 1601, 1, 1, 1),
('九月你好旅游手机海报', 'https://picsum.photos/seed/sept-mp-06/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '九月你好,九月,手机海报', 1584, 1, 1, 1),
('九月你好开学手机海报', 'https://picsum.photos/seed/sept-mp-07/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '九月你好,九月,手机海报', 1567, 1, 1, 1),
('九月你好公众号首图', 'https://picsum.photos/seed/sept-wx-01/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '九月你好,九月,公众号', 1550, 1, 1, 1),
('九月你好小红书配图', 'https://picsum.photos/seed/sept-xhs-01/400/534', 4, 2, 1242, 1660, '{"version":"1.0","layers":[]}', '九月你好,九月,小红书', 1533, 1, 1, 1),
('九月你好竖版海报', 'https://picsum.photos/seed/sept-v-01/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '九月你好,九月,手机海报', 1516, 1, 1, 1),
('九月你好长图海报', 'https://picsum.photos/seed/sept-long-01/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '九月你好,九月,长图', 1499, 1, 1, 1),
('九月你好横版海报', 'https://picsum.photos/seed/sept-h-01/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '九月你好,九月,横版', 1482, 1, 1, 1),
('九月你好简约手机海报', 'https://picsum.photos/seed/sept-mp-08/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '九月你好,九月,手机海报', 1465, 1, 1, 1),
('九月你好文艺手机海报', 'https://picsum.photos/seed/sept-mp-09/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '九月你好,九月,手机海报', 1448, 1, 1, 1),
('开学季迎新手机海报', 'https://picsum.photos/seed/school-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '开学季,开学,手机海报', 1431, 1, 1, 1),
('开学季促销手机海报', 'https://picsum.photos/seed/school-mp-02/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '开学季,开学,手机海报', 1414, 1, 1, 1),
('开学季文具手机海报', 'https://picsum.photos/seed/school-mp-03/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '开学季,开学,手机海报', 1397, 1, 1, 1),
('开学季社团手机海报', 'https://picsum.photos/seed/school-mp-04/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '开学季,开学,手机海报', 1380, 1, 1, 1),
('开学季课程手机海报', 'https://picsum.photos/seed/school-mp-05/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '开学季,开学,手机海报', 1363, 1, 1, 1),
('开学季宿舍手机海报', 'https://picsum.photos/seed/school-mp-06/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '开学季,开学,手机海报', 1346, 1, 1, 1),
('开学季军训手机海报', 'https://picsum.photos/seed/school-mp-07/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '开学季,开学,手机海报', 1329, 1, 1, 1),
('开学季公众号首图', 'https://picsum.photos/seed/school-wx-01/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '开学季,开学,公众号', 1312, 1, 1, 1),
('开学季小红书配图', 'https://picsum.photos/seed/school-xhs-01/400/534', 4, 2, 1242, 1660, '{"version":"1.0","layers":[]}', '开学季,开学,小红书', 1295, 1, 1, 1),
('开学季竖版海报', 'https://picsum.photos/seed/school-v-01/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '开学季,开学,手机海报', 1278, 1, 1, 1),
('开学季长图海报', 'https://picsum.photos/seed/school-long-01/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '开学季,开学,长图', 1261, 1, 1, 1),
('开学季横版海报', 'https://picsum.photos/seed/school-h-01/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '开学季,开学,横版', 1244, 1, 1, 1),
('开学季校园手机海报', 'https://picsum.photos/seed/school-mp-08/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '开学季,开学,手机海报', 1227, 1, 1, 1),
('开学季教育手机海报', 'https://picsum.photos/seed/school-mp-09/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '开学季,开学,手机海报', 1210, 1, 1, 1),
('教师节感恩手机海报', 'https://picsum.photos/seed/teacher-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '教师节,教师,手机海报', 1193, 1, 1, 1),
('教师节贺卡手机海报', 'https://picsum.photos/seed/teacher-mp-02/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '教师节,教师,手机海报', 1176, 1, 1, 1),
('教师节鲜花手机海报', 'https://picsum.photos/seed/teacher-mp-03/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '教师节,教师,手机海报', 1159, 1, 1, 1),
('教师节活动手机海报', 'https://picsum.photos/seed/teacher-mp-04/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '教师节,教师,手机海报', 1142, 1, 1, 1),
('教师节插画手机海报', 'https://picsum.photos/seed/teacher-mp-05/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '教师节,教师,手机海报', 1125, 1, 1, 1),
('教师节致敬手机海报', 'https://picsum.photos/seed/teacher-mp-06/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '教师节,教师,手机海报', 1108, 1, 1, 1),
('教师节班级手机海报', 'https://picsum.photos/seed/teacher-mp-07/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '教师节,教师,手机海报', 1091, 1, 1, 1),
('教师节公众号首图', 'https://picsum.photos/seed/teacher-wx-01/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '教师节,教师,公众号', 1074, 1, 1, 1),
('教师节小红书配图', 'https://picsum.photos/seed/teacher-xhs-01/400/534', 4, 2, 1242, 1660, '{"version":"1.0","layers":[]}', '教师节,教师,小红书', 1057, 1, 1, 1),
('教师节竖版海报', 'https://picsum.photos/seed/teacher-v-01/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '教师节,教师,手机海报', 1040, 1, 1, 1),
('教师节长图海报', 'https://picsum.photos/seed/teacher-long-01/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '教师节,教师,长图', 1023, 1, 1, 1),
('教师节横版海报', 'https://picsum.photos/seed/teacher-h-01/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '教师节,教师,横版', 1006, 1, 1, 1),
('教师节简约手机海报', 'https://picsum.photos/seed/teacher-mp-08/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '教师节,教师,手机海报', 989, 1, 1, 1),
('教师节祝福手机海报', 'https://picsum.photos/seed/teacher-mp-09/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '教师节,教师,手机海报', 972, 1, 1, 1),
('中秋团圆手机海报', 'https://picsum.photos/seed/zq-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中秋节,中秋,手机海报', 955, 1, 1, 1),
('中秋月饼手机海报', 'https://picsum.photos/seed/zq-mp-02/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '中秋节,中秋,手机海报', 938, 1, 1, 1),
('中秋赏月手机海报', 'https://picsum.photos/seed/zq-mp-03/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '中秋节,中秋,手机海报', 921, 1, 1, 1),
('中秋国风手机海报', 'https://picsum.photos/seed/zq-mp-04/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中秋节,中秋,手机海报', 904, 1, 1, 1),
('中秋礼盒手机海报', 'https://picsum.photos/seed/zq-mp-05/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '中秋节,中秋,手机海报', 887, 1, 1, 1),
('中秋活动手机海报', 'https://picsum.photos/seed/zq-mp-06/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '中秋节,中秋,手机海报', 870, 1, 1, 1),
('中秋插画手机海报', 'https://picsum.photos/seed/zq-mp-07/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中秋节,中秋,手机海报', 853, 1, 1, 1),
('中秋公众号首图', 'https://picsum.photos/seed/zq-wx-01/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '中秋节,中秋,公众号', 836, 1, 1, 1),
('中秋小红书配图', 'https://picsum.photos/seed/zq-xhs-01/400/534', 4, 2, 1242, 1660, '{"version":"1.0","layers":[]}', '中秋节,中秋,小红书', 819, 1, 1, 1),
('中秋竖版海报', 'https://picsum.photos/seed/zq-v-01/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中秋节,中秋,手机海报', 802, 1, 1, 1),
('中秋长图海报', 'https://picsum.photos/seed/zq-long-01/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '中秋节,中秋,长图', 785, 1, 1, 1),
('中秋横版海报', 'https://picsum.photos/seed/zq-h-01/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '中秋节,中秋,横版', 768, 1, 1, 1),
('中秋简约手机海报', 'https://picsum.photos/seed/zq-mp-08/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '中秋节,中秋,手机海报', 751, 1, 1, 1),
('中秋祝福手机海报', 'https://picsum.photos/seed/zq-mp-09/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '中秋节,中秋,手机海报', 734, 1, 1, 1),
('国庆华诞手机海报', 'https://picsum.photos/seed/gq-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '国庆节,国庆,手机海报', 717, 1, 1, 1),
('国庆红色主题手机海报', 'https://picsum.photos/seed/gq-mp-02/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '国庆节,国庆,手机海报', 700, 1, 1, 1),
('国庆旅游手机海报', 'https://picsum.photos/seed/gq-mp-03/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '国庆节,国庆,手机海报', 683, 1, 1, 1),
('国庆活动手机海报', 'https://picsum.photos/seed/gq-mp-04/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '国庆节,国庆,手机海报', 666, 1, 1, 1),
('国庆插画手机海报', 'https://picsum.photos/seed/gq-mp-05/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '国庆节,国庆,手机海报', 649, 1, 1, 1),
('国庆祝福手机海报', 'https://picsum.photos/seed/gq-mp-06/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '国庆节,国庆,手机海报', 632, 1, 1, 1),
('国庆促销手机海报', 'https://picsum.photos/seed/gq-mp-07/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '国庆节,国庆,手机海报', 615, 1, 1, 1),
('国庆公众号首图', 'https://picsum.photos/seed/gq-wx-01/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '国庆节,国庆,公众号', 598, 1, 1, 1),
('国庆小红书配图', 'https://picsum.photos/seed/gq-xhs-01/400/534', 4, 2, 1242, 1660, '{"version":"1.0","layers":[]}', '国庆节,国庆,小红书', 581, 1, 1, 1),
('国庆竖版海报', 'https://picsum.photos/seed/gq-v-01/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '国庆节,国庆,手机海报', 564, 1, 1, 1),
('国庆长图海报', 'https://picsum.photos/seed/gq-long-01/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '国庆节,国庆,长图', 547, 1, 1, 1),
('国庆横版海报', 'https://picsum.photos/seed/gq-h-01/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '国庆节,国庆,横版', 530, 1, 1, 1),
('国庆简约手机海报', 'https://picsum.photos/seed/gq-mp-08/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '国庆节,国庆,手机海报', 513, 1, 1, 1),
('国庆祖国手机海报', 'https://picsum.photos/seed/gq-mp-09/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '国庆节,国庆,手机海报', 496, 1, 1, 1),
('双十一大促手机海报', 'https://picsum.photos/seed/1111-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '双十一,双十一,手机海报', 479, 1, 1, 1),
('双十一预售手机海报', 'https://picsum.photos/seed/1111-mp-02/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '双十一,双十一,手机海报', 462, 1, 1, 1),
('双十一秒杀手机海报', 'https://picsum.photos/seed/1111-mp-03/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '双十一,双十一,手机海报', 445, 1, 1, 1),
('双十一直播手机海报', 'https://picsum.photos/seed/1111-mp-04/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '双十一,双十一,手机海报', 428, 1, 1, 1),
('双十一满减手机海报', 'https://picsum.photos/seed/1111-mp-05/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '双十一,双十一,手机海报', 411, 1, 1, 1),
('双十一电商手机海报', 'https://picsum.photos/seed/1111-mp-06/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '双十一,双十一,手机海报', 394, 1, 1, 1),
('双十一品牌手机海报', 'https://picsum.photos/seed/1111-mp-07/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '双十一,双十一,手机海报', 377, 1, 1, 1),
('双十一公众号首图', 'https://picsum.photos/seed/1111-wx-01/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '双十一,双十一,公众号', 360, 1, 1, 1),
('双十一小红书配图', 'https://picsum.photos/seed/1111-xhs-01/400/534', 4, 2, 1242, 1660, '{"version":"1.0","layers":[]}', '双十一,双十一,小红书', 343, 1, 1, 1),
('双十一竖版海报', 'https://picsum.photos/seed/1111-v-01/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '双十一,双十一,手机海报', 326, 1, 1, 1),
('双十一长图海报', 'https://picsum.photos/seed/1111-long-01/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '双十一,双十一,长图', 309, 1, 1, 1),
('双十一横版海报', 'https://picsum.photos/seed/1111-h-01/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '双十一,双十一,横版', 292, 1, 1, 1),
('双十一简约手机海报', 'https://picsum.photos/seed/1111-mp-08/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '双十一,双十一,手机海报', 275, 1, 1, 1),
('双十一狂欢手机海报', 'https://picsum.photos/seed/1111-mp-09/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '双十一,双十一,手机海报', 258, 1, 1, 1),
('圣诞快乐手机海报', 'https://picsum.photos/seed/xmas-mp-01/400/711', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,手机海报', 241, 1, 1, 1),
('圣诞礼物手机海报', 'https://picsum.photos/seed/xmas-mp-02/400/680', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,手机海报', 224, 1, 1, 1),
('圣诞派对手机海报', 'https://picsum.photos/seed/xmas-mp-03/400/760', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,手机海报', 207, 1, 1, 1),
('圣诞促销手机海报', 'https://picsum.photos/seed/xmas-mp-04/400/720', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,手机海报', 190, 1, 1, 1),
('圣诞插画手机海报', 'https://picsum.photos/seed/xmas-mp-05/400/650', 10, 2, 1080, 1680, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,手机海报', 173, 1, 1, 1),
('平安夜手机海报', 'https://picsum.photos/seed/xmas-mp-06/400/790', 10, 2, 1080, 2048, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,手机海报', 156, 1, 1, 1),
('圣诞活动手机海报', 'https://picsum.photos/seed/xmas-mp-07/400/710', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,手机海报', 139, 1, 1, 1),
('圣诞公众号首图', 'https://picsum.photos/seed/xmas-wx-01/400/171', 5, 2, 900, 383, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,公众号', 122, 1, 1, 1),
('圣诞小红书配图', 'https://picsum.photos/seed/xmas-xhs-01/400/534', 4, 2, 1242, 1660, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,小红书', 105, 1, 1, 1),
('圣诞竖版海报', 'https://picsum.photos/seed/xmas-v-01/400/700', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,手机海报', 88, 1, 1, 1),
('圣诞长图海报', 'https://picsum.photos/seed/xmas-long-01/400/910', 12, 2, 800, 2200, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,长图', 71, 1, 1, 1),
('圣诞横版海报', 'https://picsum.photos/seed/xmas-h-01/400/226', 16, 2, 1920, 1080, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,横版', 54, 1, 1, 1),
('圣诞简约手机海报', 'https://picsum.photos/seed/xmas-mp-08/400/730', 10, 2, 1080, 1920, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,手机海报', 37, 1, 1, 1),
('圣诞祝福手机海报', 'https://picsum.photos/seed/xmas-mp-09/400/820', 10, 2, 1080, 2200, '{"version":"1.0","layers":[]}', '圣诞节,圣诞,手机海报', 20, 1, 1, 1);

INSERT INTO design_template (title, cover_url, scene_id, category_id, width, height, canvas_json, tags, use_count, is_free, is_hot, is_recommend) VALUES
('销冠冠军人物喜报', 'https://picsum.photos/seed/xibao-sales/400/533', 6, 3, 1080, 1920, '{"version":"1.0","layers":[]}', '喜报,销冠', 5100, 1, 1, 1),
('团队光荣榜喜报', 'https://picsum.photos/seed/xibao-honor/400/533', 6, 3, 1080, 1920, '{"version":"1.0","layers":[]}', '喜报,光荣榜', 4900, 1, 1, 1),
('获奖证书喜报', 'https://picsum.photos/seed/xibao-award/400/533', 6, 3, 1080, 1920, '{"version":"1.0","layers":[]}', '喜报,获奖', 4700, 1, 1, 1),
('优秀员工表彰喜报', 'https://picsum.photos/seed/xibao-staff/400/533', 6, 3, 1080, 1920, '{"version":"1.0","layers":[]}', '喜报,员工', 4600, 1, 1, 1),
('国潮风企业招聘手机海报', 'https://picsum.photos/seed/zhaopin-06/400/533', 6, 4, 1080, 1920, '{"version":"1.0","layers":[]}', '招聘,国潮', 3400, 1, 1, 1);

INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'xibao', '全部模板', id, 1 FROM design_template WHERE title = '红色质感销售业绩喜报宣传手机海报';
INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'xibao', '销冠喜报', id, 2 FROM design_template WHERE title = '销冠冠军人物喜报';
INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'xibao', '业绩喜报', id, 3 FROM design_template WHERE title = '金色奖杯业绩喜报手机海报';
INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'xibao', '光荣榜', id, 4 FROM design_template WHERE title = '团队光荣榜喜报';
INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'xibao', '获奖喜报', id, 5 FROM design_template WHERE title = '获奖证书喜报';
INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'xibao', '优秀员工表彰', id, 6 FROM design_template WHERE title = '优秀员工表彰喜报';

INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'zhaopin', '扁平插画风', id, 1 FROM design_template WHERE title = '扁平插画风人才招聘手机海报';
INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'zhaopin', '渐变质感风', id, 2 FROM design_template WHERE title = '渐变质感风招聘求职人才招聘公众号首图';
INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'zhaopin', '科技风', id, 3 FROM design_template WHERE title = '科技风企业招聘海报';
INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'zhaopin', '校园招聘', id, 4 FROM design_template WHERE title = '校园招聘季宣传海报';
INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'zhaopin', '招聘小红书', id, 5 FROM design_template WHERE title = '招聘小红书';
INSERT INTO home_section_card (section_code, label, template_id, sort_order)
SELECT 'zhaopin', '国潮风', id, 6 FROM design_template WHERE title = '国潮风企业招聘手机海报';

INSERT INTO material (name, type, url, thumbnail, category, tags, is_free, use_count) VALUES
('商务背景01', 'image', 'https://picsum.photos/seed/m1/800/600', 'https://picsum.photos/seed/m1/200/150', 'background', '商务,简约', 1, 500),
('可爱贴纸-星星', 'sticker', 'https://picsum.photos/seed/m2/200/200', 'https://picsum.photos/seed/m2/100/100', 'sticker', '星星,可爱', 1, 1200),
('思源黑体', 'font', '/fonts/source-han-sans.woff2', NULL, 'font', '黑体,商用', 1, 8000),
('图标-社交', 'icon', 'https://picsum.photos/seed/m4/64/64', 'https://picsum.photos/seed/m4/32/32', 'icon', '社交,图标', 1, 300);

INSERT INTO collection_template (collection_id, template_id, sort_order) VALUES
(1, 7, 1), (1, 8, 2), (1, 13, 3),
(2, 15, 1), (2, 16, 2),
(3, 5, 1), (3, 10, 2),
(4, 1, 1), (4, 2, 2), (4, 3, 3),
(5, 2, 1), (5, 4, 2),
(6, 10, 1), (6, 11, 2);

INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 1, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%七夕%' OR title LIKE '%七夕%');
INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 2, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%中国医师节%' OR tags LIKE '%医师节%' OR title LIKE '%医师%');
INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 3, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%处暑%' OR title LIKE '%处暑%');
INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 4, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%中元节%' OR tags LIKE '%中元%' OR title LIKE '%中元%');
INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 5, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%九月你好%' OR tags LIKE '%九月%' OR title LIKE '%九月%');
INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 6, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%开学季%' OR tags LIKE '%开学%' OR title LIKE '%开学%');
INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 7, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%教师节%' OR tags LIKE '%教师%' OR title LIKE '%教师%');
INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 8, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%中秋节%' OR tags LIKE '%中秋%' OR title LIKE '%中秋%');
INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 9, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%国庆节%' OR tags LIKE '%国庆%' OR title LIKE '%国庆%');
INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 10, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%双十一%' OR title LIKE '%双十一%');
INSERT INTO calendar_event_template (event_id, template_id, sort_order)
SELECT 11, id, use_count FROM design_template WHERE status = 1 AND (tags LIKE '%圣诞节%' OR tags LIKE '%圣诞%' OR title LIKE '%圣诞%');

INSERT INTO user_design (user_id, title, cover_url, scene_id, template_id, canvas_json, width, height, status) VALUES
(1, '学习方法分享海报', 'https://picsum.photos/seed/ud1/480/360', 10, 1, '{"version":"1.0","layers":[]}', 1080, 1920, 1),
(1, '早安日签海报', 'https://picsum.photos/seed/ud2/480/360', 10, 2, '{"version":"1.0","layers":[]}', 1080, 1920, 1),
(1, '心理健康科普长图', 'https://picsum.photos/seed/ud3/480/360', 12, 4, '{"version":"1.0","layers":[]}', 800, 2000, 1),
(1, '个人所得税科普海报', 'https://picsum.photos/seed/ud4/480/360', 6, 11, '{"version":"1.0","layers":[]}', 1080, 1920, 1),
(1, '计划一件事清单', 'https://picsum.photos/seed/ud5/480/360', 10, 15, '{"version":"1.0","layers":[]}', 1080, 1920, 1),
(1, '招聘宣传手机海报', 'https://picsum.photos/seed/ud6/480/360', 10, 10, '{"version":"1.0","layers":[]}', 1080, 1920, 1),
(1, '双十一促销长图', 'https://picsum.photos/seed/ud7/480/640', 12, 5, '{"version":"1.0","layers":[]}', 800, 2000, 2),
(1, '品牌宣传PPT封面', 'https://picsum.photos/seed/ud8/480/360', 7, 8, '{"version":"1.0","layers":[]}', 1920, 1080, 1),
(1, '产品主图设计', 'https://picsum.photos/seed/ud9/480/360', 11, 12, '{"version":"1.0","layers":[]}', 800, 800, 1),
(1, '活动邀请函', 'https://picsum.photos/seed/ud10/480/360', 13, 14, '{"version":"1.0","layers":[]}', 1080, 1920, 1),
(1, '横版宣传海报', 'https://picsum.photos/seed/ud11/640/360', 16, 16, '{"version":"1.0","layers":[]}', 1920, 1080, 1),
(1, '视频封面设计', 'https://picsum.photos/seed/ud12/480/360', 17, 17, '{"version":"1.0","layers":[]}', 1280, 720, 1);

INSERT INTO design_auth_record (user_id, design_id, auth_no, design_title, cover_url, auth_type, auth_type_label, license_holder, license_no, width, height, auth_time, cert_version)
SELECT d.user_id, d.id,
       CONCAT('AUTH', CAST(d.id AS VARCHAR)),
       d.title, d.cover_url, 'commercial', '个人/企业商用授权', '演示用户', '91330100MA2DEMO001',
       d.width, d.height, DATEADD('DAY', -d.id, CURRENT_TIMESTAMP), 1
FROM user_design d
WHERE d.user_id = 1 AND d.deleted = 0 AND d.id <= 6;

INSERT INTO user_message (user_id, category, title, summary, content, link_url, link_text, is_read, create_time) VALUES
(1, 'system', '欢迎使用灵图工坊', '感谢您注册灵图工坊，开启您的创意设计之旅', '<p>亲爱的用户，欢迎加入灵图工坊！</p><p>在这里您可以：</p><ul><li>使用 100 万+ 精美模板快速创作</li><li>体验 AI 智能设计工具</li><li>下载正版商用授权作品</li></ul><p>如有任何问题，欢迎联系在线客服。</p>', '/', '前往首页', 0, DATEADD('DAY', -2, CURRENT_TIMESTAMP)),
(1, 'activity', '春季会员限时优惠', 'VIP 会员年卡 8 折，活动截止 3 月 31 日', '<p>春季特惠来袭！</p><p>即日起至 3 月 31 日，购买 VIP 年卡享 <strong>8 折优惠</strong>，还可额外获得 500 AI 积分。</p><p>立即开通，解锁全部模板与商用授权权益。</p>', '/price/vip', '立即开通', 0, DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
(1, 'order', '订单支付成功', '您的 VIP 会员订单已支付成功', '<p>订单编号：MO202603150001</p><p>商品名称：VIP 会员 · 年卡</p><p>支付金额：¥198.00</p><p>会员有效期已自动延长，感谢您的支持！</p>', '/usercenter/vip', '查看订单', 1, DATEADD('HOUR', -6, CURRENT_TIMESTAMP)),
(1, 'system', '账号安全提醒', '您的账号在新设备上登录', '<p>检测到您的账号于 2026-03-19 14:30 在新设备上登录。</p><p>如非本人操作，请立即修改密码并联系客服。</p>', NULL, NULL, 1, DATEADD('HOUR', -12, CURRENT_TIMESTAMP));

INSERT INTO user_coupon (user_id, title, coupon_code, discount_type, discount_value, min_amount, scope_label, status, expire_time, used_time, create_time) VALUES
(1, 'VIP会员立减券', 'VIP50OFF', 'amount', 5000, 10000, '适用于 VIP 会员购买', 0, DATEADD('DAY', 30, CURRENT_TIMESTAMP), NULL, DATEADD('DAY', -3, CURRENT_TIMESTAMP)),
(1, '新用户专享券', 'NEW20', 'amount', 2000, 5000, '适用于会员订单', 0, DATEADD('DAY', 15, CURRENT_TIMESTAMP), NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
(1, '春季活动折扣券', 'SPRING80', 'percent', 80, 0, '全场通用', 1, DATEADD('DAY', 10, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -20, CURRENT_TIMESTAMP)),
(1, '周年庆优惠券', 'YEAR2025', 'amount', 3000, 8000, '适用于 VIP 会员购买', 2, DATEADD('DAY', -5, CURRENT_TIMESTAMP), NULL, DATEADD('DAY', -60, CURRENT_TIMESTAMP));

INSERT INTO template_like (user_id, template_id) VALUES
(1, 1),
(1, 2),
(1, 4),
(1, 8),
(1, 11);

INSERT INTO user_design_folder (user_id, name, sort_order) VALUES
(1, '营销海报', 1),
(1, '日常运营', 2);

-- 我的设计页左侧导航（对标官网 dam-page/my）
INSERT INTO my_design_nav (name, code, route_path, sort_order) VALUES
('我的设计', 'list', '/dam-page/my/list', 1),
('我的收藏', 'favorite', '/dam-page/my/favorite', 2),
('回收站', 'recycle', '/dam-page/my/recycle', 3);

INSERT INTO user_recent (user_id, target_type, target_id) VALUES
(1, 'scene', 12),
(1, 'scene', 10),
(1, 'scene', 6),
(1, 'template', 1),
(1, 'template', 4);

INSERT INTO member_plan (group_code, group_title, group_subtitle, name, description, icon_style, link_url, sort_order) VALUES
('individual', '单人用', '(1人轻量版)', '基础版', '适合便开设计素材及AI特效的使用者', 'blue', '/vip/basic', 1),
('individual', '单人用', '(1人轻量版)', '高级版', '适合AI辅助设计的进阶AI Agent使用者', 'blue', '/vip/pro', 2),
('individual', '单人用', '(1人轻量版)', '专业版', '适合追求创意高效的深度AI Agent使用者', 'blue', '/vip/ultimate', 3),
('team', '团队用', '(2人以上团队协作)', '高级版', '适合AI辅助设计的进阶AI Agent使用团队', 'orange', '/vip/team-pro', 1),
('team', '团队用', '(2人以上团队协作)', '专业版', '适合追求创意高效的深度AI Agent使用团队', 'orange', '/vip/team-ultimate', 2),
('team', '团队用', '(2人以上团队协作)', '至尊版', '适合商量AI生成的深度AI Agent使用团队', 'orange', '/vip/team-supreme', 3),
('team', '团队用', '(2人以上团队协作)', '大企业定制', '适用于大企业/跨地域/多子公司', 'enterprise', '/vip/enterprise', 4);

-- 会员弹窗 tiers
INSERT INTO member_tier (id, group_code, code, name, description, min_seats, max_seats, sort_order, status) VALUES
(1, 'individual', 'basic', '基础版', '适合使用设计模板并用AI提效的使用者', 1, 1, 1, 1),
(2, 'individual', 'advanced', '高级版', '适合已完成工商注册的单主体企业1人使用，积分可体验Agent创作。多人企业使用请购买团队版', 1, 1, 2, 1),
(3, 'individual', 'pro', '专业版', '适合追求创意高效的深度AI Agent使用者', 1, 1, 3, 1),
(4, 'team', 'advanced', '高级版', '适合AI辅助设计的进阶AI Agent使用团队', 2, 20, 1, 1),
(5, 'team', 'professional', '专业版', '适合追求创意高效的深度AI Agent使用团队', 2, 20, 2, 1),
(6, 'team', 'supreme', '至尊版', '适合海量AI生成的深度AI Agent使用团队', 2, 20, 3, 1);

INSERT INTO member_sku (tier_id, name, price_cents, original_price_cents, badge_text, footer_text, per_month_text, duration_months, is_auto_renew, auto_renew_tip, sort_order, status) VALUES
(1, '终身', 39900, NULL, '日均最低', '长期性价比首选', NULL, 999, 0, NULL, 1, 1),
(1, '连续包季', 5900, 7900, '首季立减20', '作图尝鲜', NULL, 3, 1, '到期后将按每季度59元自动续费，可随时取消', 2, 1),
(1, '2年', 19900, NULL, '热销之选', NULL, '8.3元/月，送600积分', 24, 0, NULL, 3, 1),
(1, '连续包年', 14900, NULL, NULL, NULL, '12.4元/月，送600积分', 12, 1, '到期后将按每年149元自动续费，可随时取消', 4, 1),
(2, '1年', 39900, NULL, '无版权风险', NULL, '33.2元/月，送1500积分', 12, 0, NULL, 1, 1),
(2, '连续包季', 19900, 23900, '立减40!', NULL, NULL, 3, 1, '到期后将按每季度199元自动续费，可随时取消', 2, 1),
(2, '3年', 85900, NULL, NULL, NULL, NULL, 36, 0, NULL, 3, 1),
(2, '2年', 66900, NULL, NULL, NULL, NULL, 24, 0, NULL, 4, 1),
(3, '连续包月', 12900, 14800, '畅享海量积分', '送3800积分/月', NULL, 1, 1, '到期后将按每季度129元自动续费，可随时取消', 1, 1),
(3, '1年', 99900, NULL, '月均更低', NULL, '83.3元/月，送3800积分', 12, 0, NULL, 2, 1),
(3, '1个月', 14900, NULL, NULL, '送3800积分/月', NULL, 1, 0, NULL, 3, 1),
(4, '3年', 78900, NULL, '日均最低', '低至0.72元/天/人', NULL, 36, 0, NULL, 1, 1),
(4, '2年', 56900, NULL, NULL, '低至0.78元/天/人', NULL, 24, 0, NULL, 2, 1),
(4, '1年', 29900, NULL, NULL, '低至0.82元/天/人', NULL, 12, 0, NULL, 3, 1),
(5, '1个月', 12900, NULL, NULL, '赠3800积分/席位/月', NULL, 1, 0, NULL, 1, 1),
(5, '1年', 99900, NULL, NULL, '赠3800积分/席位/月', NULL, 12, 0, NULL, 2, 1),
(6, '1个月', 19900, NULL, NULL, '赠8000积分/席位/月', NULL, 1, 0, NULL, 1, 1),
(6, '1年', 199900, NULL, NULL, '赠8000积分/席位/月', NULL, 12, 0, NULL, 2, 1);

INSERT INTO member_benefit (tier_id, title, description, icon, sort_order, status) VALUES
(1, '个人商用授权', '商用授权*1人，支持个人&企业授权', 'shield', 1, 1),
(1, '100万+设计模板', '每日更新，轻松完成设计', 'template', 2, 1),
(1, 'Agent设计', 'Agent设计+无限画布，AI设计助手', 'agent', 3, 1),
(1, 'AI模型', 'AI生图&训练模型，主流AI模型持续更新', 'ai', 4, 1),
(1, '每月积分', '600积分/月，赋能AI创作', 'points', 5, 1),
(1, '无水印下载', '无水印高清下载，作品均可下载', 'download', 6, 1),
(2, '商用授权', '商用授权*1人，支持个人&企业授权', 'shield', 1, 1),
(2, '100万+设计模板', '每日更新，轻松完成设计', 'template', 2, 1),
(2, 'Agent设计', 'Agent设计+无限画布，AI设计助手', 'agent', 3, 1),
(2, 'AI模型', 'AI生图&训练模型，主流AI模型持续更新', 'ai', 4, 1),
(2, '每月积分', '1500积分/月，赋能AI创作', 'points', 5, 1),
(2, '无水印下载', '无水印高清下载，作品均可下载', 'download', 6, 1),
(3, '商用授权', '商用授权*1人，支持个人&企业授权', 'shield', 1, 1),
(3, '100万+设计模板', '每日更新，轻松完成设计', 'template', 2, 1),
(3, 'Agent设计', 'Agent设计+无限画布，AI设计助手', 'agent', 3, 1),
(3, 'AI模型', 'AI生图&场域模型，主流AI模型持续更新', 'ai', 4, 1),
(3, '每月积分', '3800积分/月，赋能AI创作', 'points', 5, 1),
(3, '无水印下载', '无水印高清下载，作品均可下载', 'download', 6, 1),
(4, '100万+设计模板', '每日更新，轻松完成设计', 'template', 1, 1),
(4, 'Agent设计', 'Agent设计+无限画布', 'agent', 2, 1),
(4, '无水印下载', '无水印高清下载', 'download', 3, 1),
(4, '每月积分', '1500积分/人/月，赋能AI创作', 'points', 4, 1),
(4, 'AI模型', 'AI生图&场域模型，持续更新', 'ai', 5, 1),
(4, '商用授权', '商用授权，使用无忧', 'shield', 6, 1),
(5, '100万+设计模板', '每日更新，轻松完成设计', 'template', 1, 1),
(5, 'Agent设计', 'Agent设计+无限画布', 'agent', 2, 1),
(5, '无水印下载', '无水印高清下载', 'download', 3, 1),
(5, '每月积分', '3800积分/人/月', 'points', 4, 1),
(5, 'AI模型', 'AI生图&场域模型', 'ai', 5, 1),
(5, '商用授权', '商用授权，使用无忧', 'shield', 6, 1),
(6, '100万+设计模板', '每日更新，轻松完成设计', 'template', 1, 1),
(6, 'Agent设计', 'Agent设计+无限画布', 'agent', 2, 1),
(6, '无水印下载', '无水印高清下载', 'download', 3, 1),
(6, '每月积分', '8000积分/人/月', 'points', 4, 1),
(6, 'AI模型', 'AI生图&场域模型', 'ai', 5, 1),
(6, '商用授权', '商用授权，使用无忧', 'shield', 6, 1);

-- 模板中心左侧导航（对标官网 templatecenter）
INSERT INTO template_center_nav (name, code, link_type, link_value, sort_order) VALUES
('模板中心', 'center', 'all', NULL, 1),
('抖音/小红书', 'douyin_xhs', 'category', 'douyin_xhs', 2),
('印刷/办公', 'print_office', 'category', 'print_office', 3),
('社交生活', 'social_life', 'category', 'social_life', 4),
('饭圈应援', 'fan_support', 'category', 'fan_support', 5),
('趣玩物料', 'fun_material', 'category', 'fun_material', 6),
('插画元素', 'illustration', 'category', 'illustration', 7),
('素材中心', 'material', 'material', NULL, 8),
('团队模板', 'team', 'team', NULL, 9),
('我的收藏', 'favorite', 'favorite', NULL, 10);

INSERT INTO template_filter_group (name, code, sort_order) VALUES
('分类', 'category', 1),
('场景', 'scene', 2),
('行业', 'industry', 3);

INSERT INTO template_filter_option (group_code, name, code, match_type, match_value, sort_order) VALUES
('category', '全部', 'all', 'all', NULL, 1),
('category', '海报', 'poster', 'tag', '海报', 2),
('category', '抖音/小红书', 'douyin_xhs', 'tag', '小红书', 3),
('category', '微信', 'wechat', 'tag', '公众号', 4),
('category', '电商', 'ecommerce', 'tag', '电商', 5),
('category', 'PPT', 'ppt', 'tag', 'PPT', 6),
('category', '印刷/办公', 'print_office', 'scene_category', 'print,office', 7),
('category', 'H5', 'h5', 'tag', 'H5', 8),
('category', '社交生活', 'social_life', 'scene_category', 'social', 9),
('category', '饭圈应援', 'fan_support', 'tag', '应援', 10),
('category', '趣玩物料', 'fun_material', 'tag', '物料', 11),
('category', '插画元素', 'illustration', 'tag', '插画', 12),
('scene', '推荐', 'recommend', 'all', NULL, 1),
('scene', '手机海报', 'mobile_poster', 'scene_code', 'mobile_poster', 2),
('scene', '全屏海报', 'fullscreen_poster', 'scene_code', 'fullscreen_poster', 3),
('scene', '小红书配图', 'xiaohongshu', 'scene_code', 'xiaohongshu', 4),
('scene', '公众号首图', 'wechat_cover', 'scene_code', 'wechat_cover', 5),
('scene', '横版海报', 'horizontal_poster', 'scene_code', 'horizontal_poster', 6),
('scene', '长图海报', 'long_poster', 'scene_code', 'long_poster', 7),
('scene', '视频封面', 'video_cover', 'scene_code', 'video_cover', 8),
('scene', '电商主图', 'product_main', 'scene_code', 'product_main', 9),
('scene', 'PPT', 'ppt', 'scene_code', 'ppt', 10),
('scene', '名片', 'business_card', 'scene_code', 'business_card', 11),
('scene', '直播背景', 'live_bg', 'scene_code', 'live_bg', 12),
('industry', '全部', 'all', 'all', NULL, 1),
('industry', '通用', 'general', 'tag', '通用', 2),
('industry', '教育培训', 'education', 'tag', '教育', 3),
('industry', '餐饮美食', 'food', 'tag', '美食', 4),
('industry', '金融理财', 'finance', 'tag', '金融', 5),
('industry', '医疗健康', 'health', 'tag', '医师', 6),
('industry', '电商零售', 'retail', 'tag', '电商', 7),
('industry', '地产家居', 'realestate', 'tag', '地产', 8),
('industry', '旅游出行', 'travel', 'tag', '旅游', 9);

INSERT INTO template_extra_filter (name, code, sort_order) VALUES
('颜色', 'color', 1),
('用途', 'usage', 2),
('风格', 'style', 3),
('版式', 'layout', 4),
('价格', 'price', 5),
('类型', 'type', 6);

INSERT INTO template_extra_filter_option (filter_code, name, code, color_hex, match_type, match_value, sort_order) VALUES
('color', '全部', 'all', NULL, 'all', NULL, 1),
('color', '红色', 'red', '#ff4d4f', 'tag', '红', 2),
('color', '橙色', 'orange', '#fa8c16', 'tag', '橙', 3),
('color', '黄色', 'yellow', '#fadb14', 'tag', '黄', 4),
('color', '绿色', 'green', '#52c41a', 'tag', '绿', 5),
('color', '蓝色', 'blue', '#1677ff', 'tag', '蓝', 6),
('color', '紫色', 'purple', '#722ed1', 'tag', '紫', 7),
('color', '粉色', 'pink', '#eb2f96', 'tag', '粉', 8),
('color', '黑色', 'black', '#1f2329', 'tag', '黑', 9),
('color', '白色', 'white', '#ffffff', 'tag', '白', 10),
('usage', '全部', 'all', NULL, 'all', NULL, 1),
('usage', '节日营销', 'festival', NULL, 'tag', '节日', 2),
('usage', '活动促销', 'promotion', NULL, 'tag', '促销', 3),
('usage', '招聘求职', 'recruit', NULL, 'tag', '招聘', 4),
('usage', '品牌宣传', 'brand', NULL, 'tag', '品牌', 5),
('style', '全部', 'all', NULL, 'all', NULL, 1),
('style', '简约', 'simple', NULL, 'tag', '简约', 2),
('style', '中国风', 'chinese', NULL, 'tag', '国风', 3),
('style', '手绘', 'handdrawn', NULL, 'tag', '手绘', 4),
('style', '扁平', 'flat', NULL, 'tag', '扁平', 5),
('style', '渐变', 'gradient', NULL, 'tag', '渐变', 6),
('layout', '全部', 'all', NULL, 'all', NULL, 1),
('layout', '竖版', 'vertical', NULL, 'tag', '竖版', 2),
('layout', '横版', 'horizontal', NULL, 'tag', '横版', 3),
('layout', '方形', 'square', NULL, 'tag', '方形', 4),
('layout', '长图', 'long', NULL, 'tag', '长图', 5),
('price', '全部', 'all', NULL, 'all', NULL, 1),
('price', '免费', 'free', NULL, 'is_free', '1', 2),
('price', '会员', 'vip', NULL, 'is_free', '0', 3),
('type', '全部', 'all', NULL, 'all', NULL, 1),
('type', '静态模板', 'static', NULL, 'all', NULL, 2),
('type', '视频模板', 'video', NULL, 'tag', '视频', 3);

-- 创建设计弹窗：左侧导航
INSERT INTO create_design_nav (name, code, icon, parent_code, match_type, match_value, sort_order) VALUES
('精选推荐', 'recommend', NULL, 'scene', 'all', NULL, 1),
('智能设计', 'smart', NULL, 'scene', 'scene_category', 'general', 2),
('海报', 'poster', NULL, 'scene', 'scene_category', 'marketing', 3),
('抖音/小红书', 'douyin', NULL, 'scene', 'scene_category', 'social', 4),
('微信', 'wechat', NULL, 'scene', 'scene_code', 'wechat_cover', 5),
('电商', 'ecommerce', NULL, 'scene', 'scene_category', 'ecommerce', 6),
('PPT', 'ppt', NULL, 'scene', 'scene_code', 'ppt', 7),
('印刷/办公', 'print', NULL, 'scene', 'scene_category', 'print,office', 8),
('H5', 'h5', NULL, 'scene', 'tag', 'H5', 9);

INSERT INTO create_design_size_tab (name, code, sort_order) VALUES
('常用', 'common', 1),
('收藏', 'favorite', 2),
('PC端', 'pc', 3),
('移动端', 'mobile', 4),
('印刷', 'print', 5);

-- 场景与导航/Tab 关联（按 scene code 关联，避免自增 ID 漂移）
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'common', 1 FROM design_scene WHERE code = 'long_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'common', 2 FROM design_scene WHERE code = 'mobile_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'common', 3 FROM design_scene WHERE code = 'fullscreen_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'common', 4 FROM design_scene WHERE code = 'horizontal_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'common', 5 FROM design_scene WHERE code = 'invitation';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'common', 6 FROM design_scene WHERE code = 'xiaohongshu';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'pc', 1 FROM design_scene WHERE code = 'ppt';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'pc', 2 FROM design_scene WHERE code = 'horizontal_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'pc', 3 FROM design_scene WHERE code = 'wechat_cover';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'pc', 4 FROM design_scene WHERE code = 'live_bg';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'mobile', 1 FROM design_scene WHERE code = 'mobile_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'mobile', 2 FROM design_scene WHERE code = 'fullscreen_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'mobile', 3 FROM design_scene WHERE code = 'xiaohongshu';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'mobile', 4 FROM design_scene WHERE code = 'daily_sign';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'print', 1 FROM design_scene WHERE code = 'business_card';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'print', 2 FROM design_scene WHERE code = 'certificate';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'print', 3 FROM design_scene WHERE code = 'resume';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'favorite', 1 FROM design_scene WHERE code = 'fullscreen_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'favorite', 2 FROM design_scene WHERE code = 'mobile_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'favorite', 3 FROM design_scene WHERE code = 'long_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'recommend', id, 'favorite', 4 FROM design_scene WHERE code = 'xiaohongshu';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'poster', id, 'common', 1 FROM design_scene WHERE code = 'long_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'poster', id, 'common', 2 FROM design_scene WHERE code = 'mobile_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'poster', id, 'common', 3 FROM design_scene WHERE code = 'fullscreen_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'poster', id, 'common', 4 FROM design_scene WHERE code = 'horizontal_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'poster', id, 'common', 5 FROM design_scene WHERE code = 'invitation';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'poster', id, 'mobile', 1 FROM design_scene WHERE code = 'fullscreen_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'poster', id, 'mobile', 2 FROM design_scene WHERE code = 'mobile_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'poster', id, 'pc', 1 FROM design_scene WHERE code = 'horizontal_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'poster', id, 'favorite', 1 FROM design_scene WHERE code = 'fullscreen_poster';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'douyin', id, 'common', 1 FROM design_scene WHERE code = 'xiaohongshu';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'douyin', id, 'common', 2 FROM design_scene WHERE code = 'mobile_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'douyin', id, 'common', 3 FROM design_scene WHERE code = 'daily_sign';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'douyin', id, 'common', 4 FROM design_scene WHERE code = 'long_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'douyin', id, 'mobile', 1 FROM design_scene WHERE code = 'xiaohongshu';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'douyin', id, 'mobile', 2 FROM design_scene WHERE code = 'mobile_poster';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'douyin', id, 'favorite', 1 FROM design_scene WHERE code = 'xiaohongshu';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'wechat', id, 'common', 1 FROM design_scene WHERE code = 'wechat_cover';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'wechat', id, 'common', 2 FROM design_scene WHERE code = 'daily_sign';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'wechat', id, 'pc', 1 FROM design_scene WHERE code = 'wechat_cover';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'wechat', id, 'favorite', 1 FROM design_scene WHERE code = 'wechat_cover';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'ecommerce', id, 'common', 1 FROM design_scene WHERE code = 'product_main';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'ecommerce', id, 'common', 2 FROM design_scene WHERE code = 'product_detail';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'ecommerce', id, 'mobile', 1 FROM design_scene WHERE code = 'product_main';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'ecommerce', id, 'favorite', 1 FROM design_scene WHERE code = 'product_main';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'ppt', id, 'common', 1 FROM design_scene WHERE code = 'ppt';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'ppt', id, 'pc', 1 FROM design_scene WHERE code = 'ppt';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'ppt', id, 'favorite', 1 FROM design_scene WHERE code = 'ppt';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'print', id, 'common', 1 FROM design_scene WHERE code = 'business_card';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'print', id, 'common', 2 FROM design_scene WHERE code = 'certificate';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'print', id, 'common', 3 FROM design_scene WHERE code = 'resume';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'print', id, 'print', 1 FROM design_scene WHERE code = 'business_card';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'print', id, 'print', 2 FROM design_scene WHERE code = 'certificate';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'print', id, 'print', 3 FROM design_scene WHERE code = 'resume';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'print', id, 'favorite', 1 FROM design_scene WHERE code = 'business_card';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'h5', id, 'common', 1 FROM design_scene WHERE code = 'invitation';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'h5', id, 'common', 2 FROM design_scene WHERE code = 'daily_sign';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'h5', id, 'mobile', 1 FROM design_scene WHERE code = 'invitation';

INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'smart', id, 'common', 1 FROM design_scene WHERE code = 'create';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'smart', id, 'common', 2 FROM design_scene WHERE code = 'infinite_canvas';
INSERT INTO create_design_scene_rel (nav_code, scene_id, size_tab_code, sort_order)
SELECT 'smart', id, 'common', 3 FROM design_scene WHERE code = 'image_edit';

-- 修复 design_template.scene_id（INSERT 占位序号 1-20 → 实际 scene code）
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'create') WHERE scene_id = 1;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'infinite_canvas') WHERE scene_id = 2;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'image_edit') WHERE scene_id = 3;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'xiaohongshu') WHERE scene_id = 4;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'wechat_cover') WHERE scene_id = 5;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'fullscreen_poster') WHERE scene_id = 6;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'ppt') WHERE scene_id = 7;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'business_card') WHERE scene_id = 8;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'live_bg') WHERE scene_id = 9;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'mobile_poster') WHERE scene_id = 10;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'product_main') WHERE scene_id = 11;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'long_poster') WHERE scene_id = 12;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'invitation') WHERE scene_id = 13;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'resume') WHERE scene_id = 14;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'logo') WHERE scene_id = 15;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'horizontal_poster') WHERE scene_id = 16;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'video_cover') WHERE scene_id = 17;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'product_detail') WHERE scene_id = 18;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'certificate') WHERE scene_id = 19;
UPDATE design_template SET scene_id = (SELECT id FROM design_scene WHERE code = 'daily_sign') WHERE scene_id = 20;

-- 兼容 H2 持久化库：补齐 my-design 相关字段/表
ALTER TABLE user_design ADD COLUMN IF NOT EXISTS folder_id BIGINT;
ALTER TABLE user_design ADD COLUMN IF NOT EXISTS revision BIGINT DEFAULT 1;
UPDATE user_design SET revision = 1 WHERE revision IS NULL;

ALTER TABLE team ADD COLUMN IF NOT EXISTS max_members INT DEFAULT 20;
ALTER TABLE team ADD COLUMN IF NOT EXISTS version_type VARCHAR(32) DEFAULT 'free';
ALTER TABLE team ADD COLUMN IF NOT EXISTS version_label VARCHAR(64) DEFAULT '免费团队';
ALTER TABLE team ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0;
ALTER TABLE team ADD COLUMN IF NOT EXISTS storage_total_bytes BIGINT DEFAULT 3221225472;
ALTER TABLE team ADD COLUMN IF NOT EXISTS points_balance INT DEFAULT 0;
ALTER TABLE team ADD COLUMN IF NOT EXISTS update_time DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 企业/团队账户概览
INSERT INTO team (id, name, owner_id, member_count, max_members, version_type, version_label, storage_used_bytes, storage_total_bytes, points_balance, status) VALUES
(1, '演示用户的团队', 1, 1, 20, 'free', '免费团队', 39194624, 3221225472, 50, 1);

INSERT INTO team_member (team_id, user_id, role, status) VALUES
(1, 1, 'owner', 1);

INSERT INTO enterprise_nav (id, parent_id, name, code, route_path, badge_text, sort_order, status) VALUES
(1, 0, '账户概览', 'overview', '/designtools/enterprise/accountOverview', NULL, 1, 1),
(2, 0, '使用统计', 'stats', '/designtools/enterprise/usage', NULL, 2, 1),
(3, 0, '品牌管理', 'brand', NULL, NULL, 3, 1),
(4, 3, '品牌设置', 'brand_settings', '/designtools/enterprise/brand/settings', NULL, 1, 1),
(5, 3, '品牌管制', 'brand_copy', '/designtools/enterprise/brand/copy', 'New', 2, 1),
(6, 0, '团队管理', 'team_mgmt', NULL, NULL, 4, 1),
(7, 6, '成员管理', 'members', '/designtools/enterprise/members', NULL, 1, 1),
(8, 6, '团队空间管理', 'space', '/designtools/enterprise/spaces', NULL, 2, 1),
(9, 6, '模块管理', 'modules', '/designtools/enterprise/modules', NULL, 3, 1),
(10, 6, '设计推送管理', 'push', '/designtools/enterprise/push', NULL, 4, 1),
(11, 0, '团队设置', 'team_settings', NULL, NULL, 5, 1),
(12, 11, '团队信息', 'team_info', '/designtools/enterprise/settings/info', NULL, 1, 1),
(13, 11, '个性化设置', 'personalize', '/designtools/enterprise/settings/personalize', NULL, 2, 1),
(14, 11, '更多设置', 'more', '/designtools/enterprise/settings/more', NULL, 3, 1);

INSERT INTO help_fab_menu (name, code, icon, link_url, link_target, sort_order, status) VALUES
('新手教程', 'tutorial', 'book', 'https://www.chuangkit.com/helpcenter/guide', '_blank', 1, 1),
('帮助中心', 'help-center', 'help-circle', 'https://www.chuangkit.com/helpcenter', '_blank', 2, 1),
('意见反馈', 'feedback', 'feedback', '/feedback', '_self', 3, 1),
('在线客服', 'customer-service', 'headset', NULL, 'action', 4, 1),
('提交模板需求', 'template-request', 'file-plus', 'https://www.chuangkit.com/helpcenter/template-demand', '_blank', 5, 1);

INSERT INTO feedback_config (id, page_title, intro_text, type_question_label, feedback_content_label, feedback_content_desc, feedback_content_placeholder, contact_question_label, submit_button_text, success_title, success_subtitle, reward_title, reward_subtitle, claim_button_text, claim_link_url, home_button_text, home_link_url, header_image_url, status) VALUES
(1,
 '创客贴用户意见反馈',
 '我们非常重视您的使用体验和反馈，如果您在使用创客贴过程中有任何问题、建议或意见，请随时通过本页面向我们反馈，您的反馈将帮助我们不断改进和优化产品。',
 '您想反馈的问题类型？',
 '反馈意见填写',
 '请详细描述您遇到的问题、建议或使用体验，您的每一条反馈都将帮助我们做得更好',
 '请输入您的反馈意见，如功能异常、改进建议、使用困惑等…',
 NULL,
 '提交',
 '您的答卷已经提交，感谢您的参与！',
 '若您被抽中【赠送会员】，将于10个工作日内进行派发。',
 '感谢您的耐心填写，为您准备了',
 '1份小礼物，待领取',
 '去领取',
 '/userquan',
 '返回首页',
 '/',
 NULL,
 1);

INSERT INTO feedback_type_option (code, label, sort_order, status) VALUES
('feature', '功能建议：希望增加的新功能或现有功能的改进。', 1, 1),
('material', '素材与模板：对素材丰富度、模板使用需求满足情况。', 2, 1),
('design', '设计体验：对界面设计、操作便捷性的看法。', 3, 1),
('bug', '功能问题：如软件卡顿、下载速度慢等技术问题。', 4, 1),
('other', '其他意见：任何其他您想与我们分享的想法。', 5, 1);

INSERT INTO enterprise_quick_access (name, code, description, icon, route_path, sort_order, status) VALUES
('邀请成员', 'invite', '邀请成员加入团队/企业', 'user-plus', '/designtools/enterprise/members', 1, 1),
('品牌设置', 'brand', '设置品牌色、品牌字体、品牌logo，保证品牌一致性', 'palette', '/designtools/enterprise/brand/settings', 2, 1),
('快捷开发票', 'invoice', '开票入口进度查询', 'receipt', '/designtools/enterprise/invoice', 3, 1),
('常见问题', 'faq', '获取常见问题和使用指南', 'help', '/designtools/enterprise/faq', 4, 1);

-- 团队介绍页 designIntroPage
INSERT INTO team_intro_config (id, hero_title, hero_subtitle, hero_cta_text, team_nav_badge, consultant_title, consultant_subtitle, consultant_qr_url, consultant_avatar_url, consultant_cta_text) VALUES
(1, '团队协作让设计更高效', '满足企业设计协作需求 为团队赋能提效', '免费升级团队版', '免费体验', '免费咨询', '微信扫码添加顾问', 'https://www.chuangkit.com/distsaas/img/qrcode.dcd8dda4.png', 'https://www.chuangkit.com/distsaas/img/kefu.02f16611.png', '免费试用');

INSERT INTO team_intro_feature (code, title, subtitle, image_url, layout, cta_text, bullets, sort_order, status) VALUES
('commercial', '商用模板', '企业授权，商用版权无忧', 'https://www.chuangkit.com/distsaas/img/sectionBg1.4c1dc0f0.png', 'text-left', '免费升级团队版',
 '["100万+高品质模板、1亿+版权素材、1000款+版权字体，全站内容商用保障","支持多个主体授权，资产集中规范化管理，内容审批，安全合规","满足线上线下20+场景"]', 1, 1),
('resource', '资源共享', '搭建企业专属视觉资产空间', 'https://www.chuangkit.com/distsaas/img/sectionBg2.94fd4413.png', 'text-right', '免费升级团队版',
 '["为团队打造多个专属空间，便于成员即时存取和管理资源，根据场景需求和团队结构定制化管理设计资产","支持上传PSD、AI、JPG、MP4等多种文件格式，源文件支持一键上传解析，支持在线编辑和创作，便于团队成员检索和使用","支持自定义企业品牌的核心规范，如品牌字体、配色方案和LOGO，团队成员轻松应用，确保品牌形象的一致性"]', 2, 1),
('collaboration', '团队协作', '多人多端高效创作，激发团队创造力', 'https://www.chuangkit.com/distsaas/img/sectionBg3.fd307fc8.png', 'text-left', '免费升级团队版',
 '["支持多人多终端在线编辑、查看、评论，团队成员同时进行设计协作，效率倍增","无需下载，电脑/手机云端同步更新创作/修改设计","企业PSD、AI模版上传智能化解析，高质量内容一键复用"]', 3, 1),
('ai-tools', 'AI智能工具', '拖拉拽批量高效完成设计', 'https://www.chuangkit.com/distsaas/img/sectionBg4.d5f94de0.png', 'text-right', '免费升级团队版',
 '["提供零门槛工具、满足平面设计、抠图消除图片处理、视频、H5等多种创作需求，提高企业内容生产效率","高效一键批量设计、批量抠图、批量消除、批量变清晰、批量改尺寸，智能尺寸延展","多种AI工具智能设计，简单描述即可快速生成多条文案、生成多种设计"]', 4, 1);

-- 团队升级弹窗
INSERT INTO team_upgrade_config (id, form_title, left_title, left_tags, left_collage, left_features, size_label, cta_text, cta_badge, personal_label, team_label, redirect_path) VALUES
(1, '升级为团队或企业', '商用模板素材',
 '["丰富的模板","亿级素材","精品字体"]',
 '["https://picsum.photos/seed/team-collage-1/120/90","https://picsum.photos/seed/team-collage-2/120/90","https://picsum.photos/seed/team-collage-3/120/90","https://picsum.photos/seed/team-collage-4/120/90","https://picsum.photos/seed/team-collage-5/120/90","https://picsum.photos/seed/team-collage-6/120/90"]',
 '[{"title":"企业商用 版权无忧","subtitle":"100W+ 商用模板、亿级素材、精品字体随心用"},{"title":"资源共享","subtitle":"支持PSD等50+文件格式，团队空间资源共享"},{"title":"多人设计 实时协作","subtitle":"设计一键协作/评论，多人实时手机/电脑多端协作"}]',
 '* 预估团队使用人数', '免费升级为团队/企业', '邀请成员得积分+', '个人版', '团队/企业版', '/designtools/enterprise/accountOverview');

INSERT INTO team_upgrade_size_option (code, label, max_members, sort_order, status) VALUES
('small', '2-10人', 10, 1, 1),
('large', '10人以上', 50, 2, 1);

-- AI 视频专题页（对标官网 /designtools/aitopic/aishipin）
INSERT INTO ai_topic_page (code, title, breadcrumb_parent, breadcrumb_parent_url, prompt_placeholder, generate_button_text, status) VALUES
('aishipin', 'AI视频', 'AI创作', '/tools', '上传参考图片，描述下您想要的内容，我们会为您呈现~', '生成', 1);

INSERT INTO ai_topic_preset (page_code, title, cover_url, prompt_text, card_rotate_deg, card_offset_x, card_z_index, sort_order, status) VALUES
('aishipin', '模特上身视频', 'https://pub-cdn-oss.chuangkit.com/ad_position/ee3549b25f954f748a6dd8ab72110e48', '生成模特上身展示穿搭的带货短视频，突出服装质感与穿搭效果', 3, 48, 1, 1, 1),
('aishipin', '产品展示', 'https://pub-cdn-oss.chuangkit.com/ad_position/be581a420f0a471ab823090b5739f491', '生成产品360度展示短视频，突出产品卖点与使用场景', -5, 158, 2, 2, 1),
('aishipin', 'TVC广告', 'https://pub-cdn-oss.chuangkit.com/ad_position/30814bb99d124c43be095062548b3012', '生成品牌TVC风格广告短视频，电影感画面与品牌调性', 3, 252, 3, 3, 1);

INSERT INTO ai_topic_section (page_code, title, emoji, more_text, sort_order, status) VALUES
('aishipin', '短剧带货', '🔥', '更多', 1, 1),
('aishipin', '开箱种草', '📦', '更多', 2, 1),
('aishipin', '产品演示', '🛍️', '更多', 3, 1),
('aishipin', '产品口播', '📣', '更多', 4, 1),
('aishipin', '模特上身', '👗', '更多', 5, 1),
('aishipin', '商品卖点视频', '', '更多', 6, 1);

ALTER TABLE ai_topic_inspiration ALTER COLUMN cover_hover_url VARCHAR(1024);

-- 灵感视频卡片数据见 aishipin-inspiration.sql（与官网 1:1 同步，125 条）

-- AI 海报专题页（对标官网 /designtools/aitopic/AIhaibao）
INSERT INTO ai_topic_page (code, title, breadcrumb_parent, breadcrumb_parent_url, prompt_placeholder, generate_button_text, status) VALUES
('AIhaibao', 'AI海报', 'AI创作', '/tools', '上传参考图片，描述下您需要的内容，我们会为您呈现~', '生成', 1);

INSERT INTO ai_topic_preset (page_code, title, cover_url, prompt_text, card_rotate_deg, card_offset_x, card_z_index, sort_order, status) VALUES
('AIhaibao', '小红书大字封面', 'https://pub-cdn-oss.chuangkit.com/ad_position/469a0b5d55c046649075e10c965d52c5', '生成小红书大字封面风格的海报，突出标题信息与视觉冲击力', -5, 55, 1, 1, 1),
('AIhaibao', '小红书人物封面', 'https://pub-cdn-oss.chuangkit.com/ad_position/1f500d8afbf7430283f3330155cb81c7', '生成小红书人物封面风格的海报，突出人物主体与氛围感', 3, 149, 2, 2, 1),
('AIhaibao', '招聘海报', 'https://pub-cdn-oss.chuangkit.com/ad_position/70b0fb96f56d418fbdaf2dce44d675e3', '生成招聘主题海报，突出岗位信息与品牌调性', -5, 259, 3, 3, 1),
('AIhaibao', '招生海报', 'https://pub-cdn-oss.chuangkit.com/ad_position/c9bfd8dce38442cc95a232a6f4b5d5c1', '生成招生主题海报，突出课程卖点与报名信息', 3, 353, 4, 4, 1);

INSERT INTO ai_topic_section (page_code, title, emoji, more_text, sort_order, status) VALUES
('AIhaibao', '小红书封面', '', '更多', 1, 1),
('AIhaibao', '营销海报', '', '更多', 2, 1);

-- 灵感海报卡片数据见 aihaibao-inspiration.sql
