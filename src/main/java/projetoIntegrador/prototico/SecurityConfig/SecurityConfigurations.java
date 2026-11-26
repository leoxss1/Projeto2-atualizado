
package projetoIntegrador.prototico.SecurityConfig;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfigurations {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults())

            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(req -> req

                // LOGIN E CADASTRO PÚBLICOS
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()

                // SWAGGER (documentação da API)
                .requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs",
                    "/v3/api-docs/**"
                ).permitAll()

                // VISUALIZAÇÃO DE PRODUTOS
                .requestMatchers(HttpMethod.GET, "/api/produtos", "/api/produtos/**").permitAll()

                // GERENCIAMENTO DE PRODUTOS
                .requestMatchers(HttpMethod.POST, "/api/produtos", "/api/produtos/**")
                    .hasAnyRole("VENDEDOR", "ADMIN")

                .requestMatchers(HttpMethod.PUT, "/api/produtos/**")
                    .hasAnyRole("VENDEDOR", "ADMIN")

                .requestMatchers(HttpMethod.DELETE, "/api/produtos/**")
                    .hasAnyRole("VENDEDOR", "ADMIN")

                // CARRINHO
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/carrinho",
                    "/api/carrinho/**"
                ).hasAnyRole("CLIENTE", "VENDEDOR", "ADMIN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/carrinho",
                    "/api/carrinho/**"
                ).hasAnyRole("CLIENTE", "VENDEDOR", "ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/carrinho",
                    "/api/carrinho/**"
                ).hasAnyRole("CLIENTE", "VENDEDOR", "ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/carrinho",
                    "/api/carrinho/**"
                ).hasAnyRole("CLIENTE", "VENDEDOR", "ADMIN")

                // PAGAMENTOS
                .requestMatchers(HttpMethod.POST, "/api/pagamentos/**")
                    .hasRole("CLIENTE")

                .requestMatchers(HttpMethod.DELETE, "/api/pagamentos/**")
                    .hasRole("ADMIN")

                // PROMOÇÃO DE CLIENTE PARA VENDEDOR
                .requestMatchers(HttpMethod.PATCH, "/api/usuarios/tornar-vendedor")
                    .hasRole("CLIENTE")

                // GERENCIAMENTO DE USUÁRIOS - SOMENTE ADMIN
                .requestMatchers(HttpMethod.GET, "/api/usuarios", "/api/usuarios/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.PATCH, "/api/usuarios/*/tipo")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.PUT, "/api/usuarios/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**")
                    .hasRole("ADMIN")

                // QUALQUER OUTRA ROTA EXIGE AUTENTICAÇÃO
                .anyRequest().authenticated()
            );

        return http.build();
    }

    // CODIFICAÇÃO DE SENHAS
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // GERENCIADOR DE AUTENTICAÇÃO
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    // CONFIGURAÇÃO DE CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*"
        ));

        config.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
