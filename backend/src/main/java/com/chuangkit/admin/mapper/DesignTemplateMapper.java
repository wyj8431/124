package com.chuangkit.admin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.chuangkit.admin.entity.DesignTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DesignTemplateMapper extends BaseMapper<DesignTemplate> {

    @Select("""
        SELECT dt.* FROM design_template dt
        INNER JOIN calendar_event_template cet ON cet.template_id = dt.id
        WHERE cet.event_id = #{eventId} AND dt.status = 1 AND dt.deleted = 0
        ORDER BY cet.sort_order DESC, dt.use_count DESC
        LIMIT #{limit}
        """)
    List<DesignTemplate> selectByCalendarEvent(@Param("eventId") Long eventId, @Param("limit") int limit);
}
