package com.chuangkit.admin.config;

import com.chuangkit.admin.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/admin/auth/**",
                    "/admin/home/**",
                    "/admin/team-intro/**",
                    "/admin/team-upgrade/modal",
                    "/admin/templates/**",
                    "/admin/scenes/**",
                    "/admin/categories/**",
                    "/admin/materials/**",
                    "/uploads/**",
                    "/admin/calendar/**",
                    "/admin/collections/**",
                    "/admin/template-center/**",
                    "/admin/create-design/**",
                    "/h2-console/**",
                    "/admin/swagger-ui/**",
                    "/admin/v3/api-docs/**"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/admin/design-shares/**").permitAll()
                .requestMatchers("/admin/admin/**").hasRole("ADMIN")
                .requestMatchers("/admin/ai/**", "/admin/ai-tools/**").hasRole("ADMIN")
                // AI 抠图属于管理员能力；前端隐藏入口之外，接口也必须拒绝普通用户绕过调用。
                .requestMatchers("/admin/matting/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/admin/templates/*/use", "/admin/ai/**").hasRole("ADMIN")
                .requestMatchers("/admin/designs/**", "/admin/design-shares/**", "/admin/collaboration/**", "/admin/user/**", "/admin/ai-tasks/**", "/admin/matting/**", "/admin/my-design/**", "/admin/enterprise/**", "/admin/member/checkout/**", "/admin/order-center/**", "/admin/auth-record/**", "/admin/message-center/**", "/admin/coupon-center/**", "/admin/team-upgrade/submit", "/admin/usage/**", "/admin/teams/**", "/admin/support/**", "/admin/device-alerts/**").authenticated()
                .anyRequest().permitAll()
            )
            .exceptionHandling(e -> e
                .authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"message\":\"请先登录\"}");
                })
                .accessDeniedHandler((request, response, exception) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":403,\"message\":\"没有权限执行此操作\"}");
                })
            )
            .headers(h -> h.frameOptions(f -> f.sameOrigin()))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
