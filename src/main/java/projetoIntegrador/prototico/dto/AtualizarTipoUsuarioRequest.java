package projetoIntegrador.prototico.dto;

import jakarta.validation.constraints.NotNull;
import projetoIntegrador.prototico.model.TipoUsuario;

public record AtualizarTipoUsuarioRequest(
        @NotNull TipoUsuario tipoUsuario) {
}
