let tipoSelecionado = "particular";
let selecionados = [];
let modoAdmin = false;

const frases = [
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "A persistência é o caminho do êxito.",
    "Trabalhe com dedicação e os resultados virão.",
    "Sua produtividade hoje define o seu amanhã."
];

// --- UTILITÁRIO DE BUSCA (ignora maiúsculas e acentos) ---
function normalizar(texto) {
    return (texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// --- CARGA INICIAL ---
async function carregarDadosIniciais() {
    try {
        const response = await fetch('/api/procedimentos');
        if (!response.ok) throw new Error('Falha ao carregar');
        const dados = await response.json();
        window.procedimentos = dados;

        sincronizarSelecionados();
        renderExames();
        atualizarTotal();
        atualizarDatalistCategorias();
        if (!window.fraseJaExibida) {
            atualizarFrase();
            window.fraseJaExibida = true;
        }
    } catch (error) {
        dispararToast("❌ Erro ao carregar dados", "erro");
    }
}

// Depois de editar/excluir no admin, atualiza os exames já selecionados
// com os valores novos (e remove os que foram excluídos).
function sincronizarSelecionados() {
    const todos = [];
    Object.keys(window.procedimentos).forEach(cat => {
        window.procedimentos[cat].forEach(p => todos.push(p));
    });

    selecionados = selecionados
        .map(item => {
            const atualizado = todos.find(p => p.nome === item.proc.nome);
            return atualizado ? { proc: atualizado, qtd: item.qtd } : null;
        })
        .filter(Boolean);
}

function atualizarFrase() {
    const el = document.getElementById("fraseMotivacional");
    if (el) el.innerText = `"${frases[Math.floor(Math.random() * frases.length)]}"`;
}

// --- RENDERIZAÇÃO DA LISTA ---
function renderExames() {
    const lista = document.getElementById("listaProcedimentos");
    if (!lista || !window.procedimentos) return;

    // guarda a posição do scroll para a lista não "pular" ao clicar
    const scrollAnterior = lista.scrollTop;

    lista.innerHTML = "";

    Object.keys(window.procedimentos).sort().forEach(categoria => {
        const containerCategoria = document.createElement("div");
        containerCategoria.className = "categoria-group";

        const titulo = document.createElement("div");
        titulo.className = "categoria";
        titulo.textContent = categoria.toUpperCase();
        containerCategoria.appendChild(titulo);

        window.procedimentos[categoria].forEach(proc => {
            const div = document.createElement("div");
            div.className = "exame";
            div.dataset.busca = normalizar(proc.nome); // usado pelo filtrar()

            if (selecionados.find(p => p.proc.nome === proc.nome)) {
                div.classList.add("selecionado");
            }

            const span = document.createElement("span");
            span.append(`${proc.nome} - `);
            const preco = document.createElement("strong");
            preco.textContent = `R$ ${proc.valores[tipoSelecionado].toFixed(2)}`;
            span.appendChild(preco);
            div.appendChild(span);

            if (modoAdmin) {
                const btnEdit = document.createElement("div");
                btnEdit.className = "edit-icon-container";
                btnEdit.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`;
                btnEdit.addEventListener("click", e => {
                    e.stopPropagation();
                    abrirEdicao(categoria, proc.nome);
                });
                div.appendChild(btnEdit);
            }

            div.addEventListener("click", () => toggleLinha(proc));
            containerCategoria.appendChild(div);
        });

        lista.appendChild(containerCategoria);
    });

    // reaplica a pesquisa que estava digitada (isso mantém a busca ativa)
    filtrar();

    lista.scrollTop = scrollAnterior;
    renderSelecionados();
}

// --- INTERAÇÕES DE SELEÇÃO ---
function toggleLinha(proc) {
    const index = selecionados.findIndex(p => p.proc.nome === proc.nome);
    if (index > -1) selecionados[index].qtd++;
    else selecionados.push({ proc, qtd: 1 });
    atualizarTudo();
}

function atualizarTudo() {
    atualizarTotal();
    renderExames(); // já chama filtrar() e renderSelecionados()
}

function atualizarTotal() {
    const total = selecionados.reduce((acc, i) => acc + (i.proc.valores[tipoSelecionado] * i.qtd), 0);
    document.getElementById("total").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("contador").innerText = selecionados.reduce((acc, i) => acc + i.qtd, 0);
}

function renderSelecionados() {
    const container = document.getElementById("examesSelecionados");
    if (!container) return;
    container.innerHTML = "";

    selecionados.forEach(item => {
        const chip = document.createElement("div");
        chip.className = "chip-exame";

        const menos = document.createElement("span");
        menos.className = "controle-chip";
        menos.textContent = "−";
        menos.addEventListener("click", e => {
            e.stopPropagation();
            alterarQtd(item.proc.nome, -1);
        });

        const nome = document.createElement("span");
        nome.style.margin = "0 8px";
        nome.textContent = `${item.proc.nome} (${item.qtd}x)`;

        const mais = document.createElement("span");
        mais.className = "controle-chip";
        mais.textContent = "+";
        mais.addEventListener("click", e => {
            e.stopPropagation();
            alterarQtd(item.proc.nome, 1);
        });

        const remover = document.createElement("span");
        remover.className = "controle-chip";
        remover.style.marginLeft = "10px";
        remover.style.color = "var(--danger)";
        remover.textContent = "✕";
        remover.addEventListener("click", e => {
            e.stopPropagation();
            removerExame(item.proc.nome);
        });

        chip.append(menos, nome, mais, remover);
        container.appendChild(chip);
    });
}

function alterarQtd(nome, delta) {
    const item = selecionados.find(p => p.proc.nome === nome);
    if (item) {
        item.qtd += delta;
        if (item.qtd <= 0) removerExame(nome);
        else atualizarTudo();
    }
}

function removerExame(nome) {
    selecionados = selecionados.filter(p => p.proc.nome !== nome);
    atualizarTudo();
}

function mudarTipo(tipo, btn) {
    tipoSelecionado = tipo;
    document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    atualizarTudo();
}

// --- FUNÇÕES DE TEXTO E COPIAR ---
function gerarOrcamento() {
    if (selecionados.length === 0) return dispararToast("⚠️ Selecione exames!", "aviso");
    let texto = "📝 *ORÇAMENTO DE EXAMES*\n\n";
    let totalGeral = 0;
    selecionados.forEach(item => {
        const v = item.proc.valores[tipoSelecionado];
        const sub = v * item.qtd;
        totalGeral += sub;
        texto += `• ${item.proc.nome} (${item.qtd}x): R$ ${sub.toFixed(2)}\n`;
    });
    texto += `\n*TOTAL: R$ ${totalGeral.toFixed(2)}*`;
    const campo = document.getElementById("resultado");
    campo.value = texto;
    campo.style.height = campo.scrollHeight + "px";
    dispararToast("✨ Orçamento gerado!");
}

function copiarOrcamento() {
    const campo = document.getElementById("resultado");
    if (!campo || !campo.value) return dispararToast("⚠️ Gere o orçamento primeiro!", "aviso");

    // Tenta a API moderna; se não houver (ou falhar), usa o método antigo
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(campo.value)
            .then(() => dispararToast("📋 Copiado com sucesso!"))
            .catch(() => copiarFallback(campo.value));
    } else {
        copiarFallback(campo.value);
    }
}

function copiarFallback(texto) {
    const tempInput = document.createElement("textarea");
    tempInput.value = texto;
    tempInput.style.position = "fixed";
    tempInput.style.opacity = "0";
    document.body.appendChild(tempInput);

    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Para mobile
    document.execCommand("copy");

    document.body.removeChild(tempInput);
    dispararToast("📋 Copiado com sucesso!");
}

function limparOrcamento() {
    selecionados = [];
    document.getElementById("resultado").value = "";
    document.getElementById("resultado").style.height = "150px";
    atualizarTudo();
    dispararToast("🧹 Lista limpa!");
}

// --- ADMIN E MODAIS ---
const SENHA_CORRETA = "22032016";

function verificarAcessoAdmin() {
    document.getElementById('modalLoginAdmin').style.display = 'flex';
    document.getElementById('senhaAdminInput').value = "";
    document.getElementById('senhaAdminInput').focus();
}

function confirmarLogin() {
    if (document.getElementById('senhaAdminInput').value === SENHA_CORRETA) {
        modoAdmin = true;
        document.getElementById('btnNovoProcedimento').style.display = 'block';
        fecharModal();
        renderExames();
        dispararToast("🔓 Modo Admin Ativado!");
    } else {
        dispararToast("❌ Senha incorreta!", "erro");
    }
}

function sairAdministrador() {
    modoAdmin = false;
    document.getElementById('btnNovoProcedimento').style.display = 'none';
    fecharModal();
    renderExames();
    dispararToast("🔒 Saiu do Admin");
}

function fecharModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function abrirEdicao(categoria, nomeExame) {
    const proc = window.procedimentos[categoria].find(p => p.nome === nomeExame);
    if (!proc) return;
    document.getElementById('tituloModalAdmin').innerText = "Editar Procedimento";
    document.getElementById('editCategoria').value = categoria;
    document.getElementById('editNome').value = proc.nome;
    document.getElementById('vParticular').value = proc.valores.particular;
    document.getElementById('vDesconto').value = proc.valores.desconto;
    document.getElementById('vEspecial').value = proc.valores.especial;
    document.getElementById('vPrefeitura').value = proc.valores.prefeitura;
    document.getElementById('modalAdmin').style.display = 'flex';
}

function abrirNovoProcedimento() {
    document.getElementById('tituloModalAdmin').innerText = "Novo Procedimento";
    document.querySelectorAll('#modalAdmin input').forEach(i => i.value = "");
    document.getElementById('modalAdmin').style.display = 'flex';
}

// --- BANCO DE DADOS (POST E DELETE) ---
async function salvarAlteracao() {
    const data = {
        categoria: document.getElementById('editCategoria').value.toUpperCase(),
        nome: document.getElementById('editNome').value,
        valores: {
            particular: parseFloat(document.getElementById('vParticular').value) || 0,
            desconto: parseFloat(document.getElementById('vDesconto').value) || 0,
            especial: parseFloat(document.getElementById('vEspecial').value) || 0,
            prefeitura: parseFloat(document.getElementById('vPrefeitura').value) || 0
        }
    };

    try {
        const resp = await fetch('/api/procedimentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.ok) {
            fecharModal();
            await carregarDadosIniciais();
            dispararToast("✅ Salvo com sucesso!");
        } else {
            dispararToast("❌ Erro ao salvar", "erro");
        }
    } catch (e) { dispararToast("❌ Erro ao salvar", "erro"); }
}

async function excluirProcedimento() {
    const nome = document.getElementById('editNome').value;
    if (!nome || !confirm(`Deseja excluir permanentemente: ${nome}?`)) return;

    try {
        const resp = await fetch(`/api/procedimentos/${encodeURIComponent(nome)}`, { method: 'DELETE' });
        if (resp.ok) {
            fecharModal();
            await carregarDadosIniciais();
            dispararToast("🗑️ Excluído com sucesso!");
        } else {
            dispararToast("❌ Erro ao excluir (404/500)", "erro");
        }
    } catch (e) { dispararToast("❌ Erro de rede", "erro"); }
}

// --- BUSCA ---
function filtrar() {
    const campoBusca = document.getElementById("busca");
    const termo = normalizar(campoBusca ? campoBusca.value : "").trim();
    const grupos = document.querySelectorAll(".categoria-group");

    grupos.forEach(grupo => {
        let temExameVisivel = false;

        grupo.querySelectorAll(".exame").forEach(exame => {
            // busca só pelo nome do exame (não pelo preço)
            if ((exame.dataset.busca || "").includes(termo)) {
                exame.style.display = "flex";
                temExameVisivel = true;
            } else {
                exame.style.display = "none";
            }
        });

        // Esconde a categoria inteira se não tiver nenhum exame nela
        grupo.style.display = temExameVisivel ? "block" : "none";
    });
}

// --- UTILITÁRIOS ---
function dispararToast(mensagem, tipo = "sucesso") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    // Reseta o estado
    toast.className = "";
    void toast.offsetWidth; // Trigger reflow para reiniciar animação

    toast.innerHTML = mensagem;
    toast.classList.add("mostrar");
    if (tipo === "erro") toast.classList.add("erro");
    if (tipo === "aviso") toast.classList.add("aviso");

    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove("mostrar");
    }, 2500);
}

function atualizarDatalistCategorias() {
    const dl = document.getElementById('listaCategorias');
    if (!dl || !window.procedimentos) return;
    dl.innerHTML = "";
    Object.keys(window.procedimentos).forEach(c => {
        dl.innerHTML += `<option value="${c}">`;
    });
}

// --- EVENTOS ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosIniciais();
    document.getElementById('senhaAdminInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') confirmarLogin();
    });
});