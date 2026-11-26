
const API_URL = "http://localhost:8080/api/usuarios";

const listaUsuarios = document.getElementById("listaUsuarios");
const totalUsuarios = document.getElementById("totalUsuarios");
const mensagem = document.getElementById("mensagem");
const btnAtualizar = document.getElementById("btnAtualizar");

let usuarioLogado = null;
let temporizadorMensagem;

// Exibe mensagens na tela.
function exibirMensagem(texto, tipo) {

    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
    mensagem.style.display = "block";

    clearTimeout(temporizadorMensagem);

    temporizadorMensagem = setTimeout(() => {
        mensagem.style.display = "none";
    }, 4000);
}

// Busca os usuários cadastrados.
async function carregarUsuarios() {

    listaUsuarios.innerHTML = `
        <tr>
            <td colspan="5">Carregando usuários...</td>
        </tr>
    `;

    try {

        const resposta = await fetch(API_URL, {
            method: "GET",
            credentials: "include"
        });

        if (resposta.status === 401) {
            throw new Error("Sua sessão expirou. Faça login novamente.");
        }

        if (resposta.status === 403) {
            throw new Error("Você não possui permissão para gerenciar usuários.");
        }

        if (!resposta.ok) {
            throw new Error("Erro ao buscar usuários.");
        }

        const usuarios = await resposta.json();

        listarUsuarios(usuarios);

    } catch (erro) {

        listaUsuarios.innerHTML = `
            <tr>
                <td colspan="5">${erro.message}</td>
            </tr>
        `;

        totalUsuarios.textContent = "0";

        exibirMensagem(erro.message, "erro");
    }
}

// Preenche a tabela com os usuários.
function listarUsuarios(usuarios) {

    listaUsuarios.innerHTML = "";

    totalUsuarios.textContent = usuarios.length;

    if (usuarios.length === 0) {

        listaUsuarios.innerHTML = `
            <tr>
                <td colspan="5">Nenhum usuário cadastrado.</td>
            </tr>
        `;

        return;
    }

    usuarios.forEach(usuario => {

        const linha = document.createElement("tr");

        const tipo = usuario.tipoUsuario || "CLIENTE";

        const id = document.createElement("td");
        id.textContent = usuario.id;

        const nome = document.createElement("td");
        nome.textContent = usuario.nome;

        const email = document.createElement("td");
        email.textContent = usuario.email;

        const tipoCelula = document.createElement("td");

        const ehContaAtual = String(usuario.id) === String(usuarioLogado.id);

        if (tipo === "ADMIN" || ehContaAtual) {

            // Administradores e a própria conta não podem ter o tipo alterado.
            const tipoSpan = document.createElement("span");
            tipoSpan.className = `tipo tipo-${tipo}`;
            tipoSpan.textContent = tipo;

            tipoCelula.appendChild(tipoSpan);

        } else {

            const seletor = document.createElement("select");
            seletor.className = `seletor-tipo tipo-${tipo}`;

            [["CLIENTE", "Cliente"], ["VENDEDOR", "Vendedor"]].forEach(([valor, rotulo]) => {
                const opcao = document.createElement("option");
                opcao.value = valor;
                opcao.textContent = rotulo;
                seletor.appendChild(opcao);
            });

            seletor.value = tipo;

            seletor.addEventListener("change", () => {
                alterarTipo(usuario.id, usuario.nome, tipo, seletor);
            });

            tipoCelula.appendChild(seletor);
        }

        const acoes = document.createElement("td");

        // Não permite excluir o próprio administrador.
        if (String(usuario.id) === String(usuarioLogado.id)) {

            const texto = document.createElement("span");
            texto.textContent = "Conta atual";
            texto.className = "texto-conta-atual";

            acoes.appendChild(texto);

        } else {

            const botaoDeletar = document.createElement("button");

            botaoDeletar.textContent = "Excluir";
            botaoDeletar.className = "btn-deletar";

            botaoDeletar.addEventListener("click", () => {
                deletarUsuario(usuario.id, usuario.nome, botaoDeletar);
            });

            acoes.appendChild(botaoDeletar);
        }

        linha.append(id, nome, email, tipoCelula, acoes);

        listaUsuarios.appendChild(linha);
    });
}

// Altera o tipo (CLIENTE / VENDEDOR) de um usuário.
async function alterarTipo(id, nome, tipoAnterior, seletor) {

    const novoTipo = seletor.value;

    if (novoTipo === tipoAnterior) {
        return;
    }

    seletor.disabled = true;

    try {

        const resposta = await fetch(`${API_URL}/${id}/tipo`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tipoUsuario: novoTipo })
        });

        if (resposta.status === 401) {
            throw new Error("Sua sessão expirou. Faça login novamente.");
        }

        if (resposta.status === 403) {
            throw new Error("Você não possui permissão para alterar o tipo de usuário.");
        }

        if (!resposta.ok) {
            throw new Error("Não foi possível alterar o tipo do usuário.");
        }

        exibirMensagem(
            `${nome} agora é ${novoTipo === "VENDEDOR" ? "Vendedor" : "Cliente"}.`,
            "sucesso"
        );

        // Recarrega a lista para refletir o estado real do servidor.
        await carregarUsuarios();

    } catch (erro) {

        // Desfaz a seleção visual em caso de erro.
        seletor.value = tipoAnterior;
        seletor.disabled = false;

        exibirMensagem(erro.message, "erro");
    }
}

// Exclui um usuário.
async function deletarUsuario(id, nome, botao) {

    // Proteção adicional contra exclusão da própria conta.
    if (String(id) === String(usuarioLogado.id)) {
        exibirMensagem(
            "Você não pode excluir sua própria conta.",
            "erro"
        );
        return;
    }

    const confirmar = confirm(
        `Tem certeza que deseja excluir o usuário ${nome}?`
    );

    if (!confirmar) {
        return;
    }

    botao.disabled = true;
    botao.textContent = "Excluindo...";

    try {

        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (resposta.status === 401) {
            throw new Error("Sua sessão expirou. Faça login novamente.");
        }

        if (resposta.status === 403) {
            throw new Error("Você não possui permissão para excluir usuários.");
        }

        if (!resposta.ok) {
            throw new Error("Não foi possível excluir o usuário.");
        }

        exibirMensagem("Usuário excluído com sucesso!", "sucesso");

        await carregarUsuarios();

    } catch (erro) {

        exibirMensagem(erro.message, "erro");

        botao.disabled = false;
        botao.textContent = "Excluir";
    }
}

// Inicialização da página.
document.addEventListener("DOMContentLoaded", () => {

    // Recupera o usuário autenticado.
    try {
        usuarioLogado = JSON.parse(
            sessionStorage.getItem("usuarioLogado")
        );
    } catch (erro) {
        usuarioLogado = null;
    }

    // Verifica se é administrador.
    if (!usuarioLogado || usuarioLogado.tipoUsuario !== "ADMIN") {

        alert("Acesso permitido somente para administradores.");

        window.location.replace("home.html");

        return;
    }

    // Eventos da página.
    btnAtualizar.addEventListener("click", carregarUsuarios);

    // Carrega os usuários ao abrir a página.
    carregarUsuarios();
});
