package com.chuangkit.admin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.chuangkit.admin.entity.UserDesign;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface UserDesignMapper extends BaseMapper<UserDesign> {

    @Select("""
        SELECT * FROM user_design
        WHERE user_id = #{userId} AND deleted = 1
        ORDER BY update_time DESC
        """)
    List<UserDesign> selectRecycleBin(@Param("userId") Long userId);

    @Update("""
        UPDATE user_design SET deleted = 0, update_time = CURRENT_TIMESTAMP
        WHERE id = #{id} AND user_id = #{userId} AND deleted = 1
        """)
    int restoreFromRecycle(@Param("id") Long id, @Param("userId") Long userId);

    @Delete("""
        DELETE FROM user_design
        WHERE id = #{id} AND user_id = #{userId} AND deleted = 1
        """)
    int permanentDelete(@Param("id") Long id, @Param("userId") Long userId);
}
