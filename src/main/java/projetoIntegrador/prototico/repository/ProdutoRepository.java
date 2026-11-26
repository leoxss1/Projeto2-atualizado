package projetoIntegrador.prototico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projetoIntegrador.prototico.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

}