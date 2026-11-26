
package projetoIntegrador.prototico.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

import projetoIntegrador.prototico.model.Produto;
import projetoIntegrador.prototico.service.ProdutoService;
import projetoIntegrador.prototico.repository.CarrinhoRepository;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(
    origins = "http://localhost:5500",
    allowCredentials = "true"
)
public class ProdutoController {

    private final ProdutoService service;
    private final CarrinhoRepository carrinhoRepository;

    public ProdutoController(
            ProdutoService service,
            CarrinhoRepository carrinhoRepository) {

        this.service = service;
        this.carrinhoRepository = carrinhoRepository;
    }

    @GetMapping
    public List<Produto> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Produto cadastrar(@RequestBody @Valid Produto produto) {
        return service.cadastrar(produto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid Produto produto) {

        return ResponseEntity.ok(service.atualizar(id, produto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {

        if (carrinhoRepository.existsByProduto_Id(id)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Não é possível excluir este produto porque ele está associado a um carrinho."
            );
        }

        service.excluir(id);
    }
}
