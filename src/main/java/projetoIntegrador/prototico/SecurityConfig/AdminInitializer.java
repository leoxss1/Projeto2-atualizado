package projetoIntegrador.prototico.SecurityConfig;

import projetoIntegrador.prototico.model.Usuario;
import projetoIntegrador.prototico.model.TipoUsuario;
import projetoIntegrador.prototico.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner criarAdmin(
            UsuarioRepository repository,
            PasswordEncoder passwordEncoder,

            @Value("${app.admin.email}") String email,
            @Value("${app.admin.password}") String senha) {

        return args -> {

            if (repository.findByEmail(email).isEmpty()) {

                Usuario admin = new Usuario();

                admin.setNome("Admin");
                admin.setTelefone("11999999999");
                admin.setEmail(email);
                admin.setSenha(passwordEncoder.encode(senha));
                admin.setEndereco("Endereço administrativo");
                admin.setTipoUsuario(TipoUsuario.ADMIN);

                repository.save(admin);

                System.out.println("Administrador inicial criado!");
            }
        };
    }
}
