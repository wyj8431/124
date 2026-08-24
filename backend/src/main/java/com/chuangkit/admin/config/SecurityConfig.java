package com.chuangkit.admin.config;

import com.chuangkit.admin.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
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
                    "/admin/ai-tools/**",
                    "/admin/ai/**",
                    "/uploads/**",
                    "/admin/calendar/**",
                    "/admin/collections/**",
                    "/admin/template-center/**",
                    "/admin/create-design/**",
                    "/h2-console/**",
                    "/admin/swagger-ui/**",
                    "/admin/v3/api-docs/**"
                ).permitAll()
                .requestMatchers("/admin/admin/**").hasRole("ADMIN")
                .requestMatchers("/admin/designs/**", "/admin/user/**", "/admin/ai-tasks/**", "/admin/my-design/**", "/admin/enterprise/**", "/admin/member/checkout/**", "/admin/order-center/**", "/admin/auth-record/**", "/admin/message-center/**", "/admin/coupon-center/**", "/admin/team-upgrade/submit", "/admin/usage/**", "/admin/teams/**", "/admin/support/**", "/admin/device-alerts/**").authenticated()
                .anyRequest().permitAll()
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
