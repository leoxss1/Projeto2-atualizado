
const API_CARRINHO_URL = "http://localhost:8080/api/carrinho";

// Formata valores em reais.
function moeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Configuração padrão das requisições.
const configuracaoFetch = {
    credentials: "include"
};

// Busca os produtos do carrinho.
async function obterCarrinho() {
    const resposta = await fetch(API_CARRINHO_URL, {
        ...configuracaoFetch,
        method: "GET"
    });

    if (!resposta.ok) {
        throw new Error("Erro ao buscar carrinho. Status: " + resposta.status);
    }

    return await resposta.json();
}

// Adiciona um produto ao carrinho.
async function adicionarProduto(produto) {
    try {
        const carrinho = await obterCarrinho();

        const existente = carrinho.find(
            item => Number(item.produto.id) === Number(produto.id)
        );

        if (existente) {
            await atualizarItem(
                existente,
                existente.quantidade + 1
            );
        } else {
            const resposta = await fetch(API_CARRINHO_URL, {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    produto: {
                        id: produto.id
                    },
                    quantidade: 1,
                    precoUni: Number(produto.preco),
                    subTotal: Number(produto.preco)
                })
            });

            if (!resposta.ok) {
                const erro = await resposta.text();
                console.error("Resposta do backend:", erro);
                throw new Error(erro || "Erro ao adicionar produto.");
            }
        }

        alert(`${produto.nome} foi adicionado ao carrinho!`);

        await renderizarCarrinho();

    } catch (erro) {
        console.error("Erro ao adicionar ao carrinho:", erro);
        alert("Não foi possível adicionar o produto.");
    }
}


// Atualiza um item no backend.

async function atualizarItem(item, quantidade) {
    const resposta = await fetch(`${API_CARRINHO_URL}/${item.id}`, {
        credentials: "include",
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            produto: {
                id: item.produto.id
            },
            quantidade: quantidade,
            precoUni: Number(item.precoUni),
            subTotal: quantidade * Number(item.precoUni)
        })
    });

    if (!resposta.ok) {
        const erro = await resposta.text();
        console.error("Erro retornado pelo backend:", erro);
        throw new Error("Erro ao atualizar produto.");
    }
}


// Altera a quantidade.
async function alterarQuantidade(id, delta) {
    try {
        const carrinho = await obterCarrinho();

        const item = carrinho.find(
            produto => Number(produto.id) === Number(id)
        );

        if (!item) return;

        const novaQuantidade = item.quantidade + delta;

        if (novaQuantidade <= 0) {
            await removerProduto(id);
            return;
        }

        await atualizarItem(item, novaQuantidade);

        await renderizarCarrinho();

    } catch (erro) {
        console.error("Erro ao alterar quantidade:", erro);
        alert("Erro ao alterar quantidade.");
    }
}

// Remove um produto.
async function removerProduto(id) {
    try {
        const resposta = await fetch(`${API_CARRINHO_URL}/${id}`, {
            ...configuracaoFetch,
            method: "DELETE"
        });

        if (!resposta.ok) {
            throw new Error("Erro ao remover produto.");
        }

        await renderizarCarrinho();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao remover produto.");
    }
}

// Configura botões de compra que utilizam a classe .btn-comprar.
function configurarBotoesComprar() {
    document.querySelectorAll(".btn-comprar").forEach(botao => {

        botao.addEventListener("click", async event => {
            event.preventDefault();

            const card = botao.closest(".catalogo-card");

            const produtoId = Number(
                card?.dataset.produtoId || botao.dataset.produtoId
            );

            if (!produtoId) {
                alert("ID do produto não encontrado.");
                return;
            }

            const nome = card?.querySelector("h3")?.textContent.trim();
            const precoTexto = card?.querySelector(".produto-preco")?.textContent;

            if (!nome || !precoTexto) {
                alert("Não foi possível identificar o produto.");
                return;
            }

            const preco = Number(
                precoTexto.replace(/[^\d,]/g, "")
                    .replace(",", ".")
            );

            await adicionarProduto({
                id: produtoId,
                nome: nome,
                preco: preco
            });
        });
    });
}

// Exibe os produtos na tela.
async function renderizarCarrinho() {
    const lista = document.getElementById("carrinho-lista");

    if (!lista) return;

    try {
        const carrinho = await obterCarrinho();

        const vazio = document.getElementById("carrinho-vazio");
        const totalBox = document.getElementById("carrinho-total");

        lista.innerHTML = "";

        vazio.hidden = carrinho.length > 0;
        totalBox.hidden = carrinho.length === 0;

        let total = 0;

        carrinho.forEach(item => {

            const subtotal = Number(item.subTotal);
            total += subtotal;

            const linha = document.createElement("article");
            linha.className = "carrinho-item";

            const info = document.createElement("div");
            info.className = "item-info";

            const nome = document.createElement("h3");
            nome.textContent = item.produto.nome;

            const preco = document.createElement("p");
            preco.textContent = `${moeda(item.precoUni)} cada`;

            info.append(nome, preco);

            const qtd = document.createElement("div");
            qtd.className = "item-quantidade";

            const menos = document.createElement("button");
            menos.className = "btn-qtd";
            menos.type = "button";
            menos.textContent = "−";

            menos.addEventListener("click", () => {
                alterarQuantidade(item.id, -1);
            });

            const numero = document.createElement("span");
            numero.textContent = item.quantidade;

            const mais = document.createElement("button");
            mais.className = "btn-qtd";
            mais.type = "button";
            mais.textContent = "+";

            mais.addEventListener("click", () => {
                alterarQuantidade(item.id, 1);
            });

            qtd.append(menos, numero, mais);

            const valor = document.createElement("strong");
            valor.className = "item-subtotal";
            valor.textContent = moeda(subtotal);

            const remover = document.createElement("button");
            remover.className = "btn-remover";
            remover.type = "button";
            remover.textContent = "Remover";

            remover.addEventListener("click", () => {
                removerProduto(item.id);
            });

            linha.append(info, qtd, valor, remover);

            lista.appendChild(linha);
        });

        document.getElementById("valor-total").textContent = moeda(total);

    } catch (erro) {
        console.error("Erro ao renderizar carrinho:", erro);
        alert("Não foi possível carregar o carrinho.");
    }
}

// Finaliza o pedido pelo WhatsApp.
async function finalizarPedido() {
    try {
        const carrinho = await obterCarrinho();

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const itens = carrinho.map(item =>
            `• ${item.produto.nome} - ${item.quantidade}x ${moeda(item.precoUni)} = ${moeda(item.subTotal)}`
        );

        const total = carrinho.reduce(
            (soma, item) => soma + Number(item.subTotal),
            0
        );

        const mensagem = [
            "Olá! Gostaria de fazer este pedido:",
            "",
            ...itens,
            "",
            `*Total: ${moeda(total)}*`
        ].join("\n");

        window.open(
            `https://wa.me/5511948645432?text=${encodeURIComponent(mensagem)}`,
            "_blank"
        );

    } catch (erro) {
        console.error("Erro ao finalizar pedido:", erro);
        alert("Não foi possível finalizar o pedido.");
    }
}

// Inicialização.
document.addEventListener("DOMContentLoaded", () => {

    configurarBotoesComprar();

    renderizarCarrinho();

    document.getElementById("btn-finalizar")
        ?.addEventListener("click", finalizarPedido);

});
