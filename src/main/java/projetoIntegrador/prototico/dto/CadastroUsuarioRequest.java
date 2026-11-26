package projetoIntegrador.prototico.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroUsuarioRequest(
        @NotBlank String nome,
        @NotBlank String telefone,
        @NotBlank @Email String email,
        @NotBlank String endereco,
        @NotBlank @Size(min = 6) String senha) {
}
