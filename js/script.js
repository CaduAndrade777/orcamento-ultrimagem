let tipoSelecionado = "particular";
let selecionados = [];
let modoAdmin = false;

const frases = [
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "A persistência é o caminho do êxito.",
    "Trabalhe com dedicação e os resultados virão.",
    "Sua produtividade hoje define o seu amanhã."
];

// --- CARGA INICIAL DO MYSQL ---
async function carregarDadosIniciais() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/procedimentos');
        if (!response.ok) throw new Error("Erro na rede");
        
        const dados = await response.json();
        window.procedimentos = dados;
        
        atualizarFrase();
        renderExames();
    } catch (error) {
        console.error("Erro ao carregar exames do MySQL:", error);
        dispararToast("❌ Falha ao carregar dados do servidor", "erro");
        window.procedimentos = window.procedimentos || {};
    }
}

function atualizarFrase() {
    const el = document.getElementById("fraseMotivacional");
    if (el) {
        const randomFrase = frases[Math.floor(Math.random() * frases.length)];
        el.innerText = `"${randomFrase}"`;
    }
}

function renderExames() {
    const lista = document.getElementById("listaProcedimentos");
    if (!lista || !window.procedimentos) return;
    lista.innerHTML = "";

    const categorias = Object.keys(window.procedimentos).sort();

    categorias.forEach(categoria => {
        const exames = window.procedimentos[categoria];
        const containerCategoria = document.createElement("div");
        containerCategoria.className = "categoria-group";

        const titulo = document.createElement("div");
        titulo.className = "categoria";
        titulo.innerText = categoria.toUpperCase();
        containerCategoria.appendChild(titulo);

        exames.forEach(proc => {
            const div = document.createElement("div");
            div.className = "exame";
            if (selecionados.find(p => p.proc.nome === proc.nome)) div.classList.add("selecionado");

            const btnEdit = modoAdmin ? `
                <div class="edit-icon-container" onclick="event.stopPropagation(); abrirEdicao('${categoria}', '${proc.nome}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                </div>` : "";

            div.innerHTML = `<span>${proc.nome} - <strong>R$ ${proc.valores[tipoSelecionado]}</strong></span> ${btnEdit}`;
            div.onclick = () => toggleLinha(proc);
            containerCategoria.appendChild(div);
        });

        lista.appendChild(containerCategoria);
    });
    renderSelecionados();
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

    window.editandoAgora = { categoriaAnterior: categoria, nomeAnterior: proc.nome };
    document.getElementById('modalAdmin').style.display = 'flex';
}

function abrirNovoProcedimento() {
    document.getElementById('tituloModalAdmin').innerText = "Novo Procedimento";
    document.getElementById('editCategoria').value = "";
    document.getElementById('editNome').value = "";
    document.getElementById('vParticular').value = "";
    document.getElementById('vDesconto').value = "";
    document.getElementById('vEspecial').value = "";
    document.getElementById('vPrefeitura').value = "";
    
    window.editandoAgora = null;
    document.getElementById('modalAdmin').style.display = 'flex';
}

async function salvarAlteracao() {
    const procData = {
        categoria: document.getElementById('editCategoria').value,
        nome: document.getElementById('editNome').value,
        valores: {
            particular: parseFloat(document.getElementById('vParticular').value || 0),
            desconto: parseFloat(document.getElementById('vDesconto').value || 0),
            especial: parseFloat(document.getElementById('vEspecial').value || 0),
            prefeitura: parseFloat(document.getElementById('vPrefeitura').value || 0)
        }
    };

    try {
        const response = await fetch('http://localhost:8000/api/procedimentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(procData)
        });

        if (response.ok) {
            dispararToast("✅ Salvo no servidor!");
            fecharModal();
            await carregarDadosIniciais(); 
        }
    } catch (error) {
        dispararToast("❌ Erro ao conectar com o servidor", "erro");
    }
}

// --- FUNÇÕES DE INTERAÇÃO (Chip, Toggle, etc) ---

function toggleLinha(proc) {
    const index = selecionados.findIndex(p => p.proc.nome === proc.nome);
    if (index > -1) {
        selecionados[index].qtd++;
    } else {
        selecionados.push({ proc, qtd: 1 });
    }
    atualizarTudo();
}

function adicionarMaisUm(nome) {
    const item = selecionados.find(p => p.proc.nome === nome);
    if (item) item.qtd++;
    atualizarTudo();
}

function diminuirExame(nome) {
    const index = selecionados.findIndex(p => p.proc.nome === nome);
    if (index > -1) {
        selecionados[index].qtd--;
        if (selecionados[index].qtd <= 0) selecionados.splice(index, 1);
    }
    atualizarTudo();
}

function removerExame(nome) {
    selecionados = selecionados.filter(p => p.proc.nome !== nome);
    atualizarTudo();
}

function renderSelecionados() {
    const container = document.getElementById("examesSelecionados");
    if (!container) return;
    container.innerHTML = "";

    selecionados.forEach(item => {
        const chip = document.createElement("div");
        chip.className = "chip-exame";
        chip.innerHTML = `
            <span class="controle-chip" onclick="diminuirExame('${item.proc.nome}')">−</span>
            <span style="margin: 0 8px;">${item.proc.nome} (${item.qtd}x)</span>
            <span class="controle-chip" onclick="adicionarMaisUm('${item.proc.nome}')">+</span>
            <span class="controle-chip" style="margin-left:10px; color:var(--danger); font-size: 12px;" onclick="removerExame('${item.proc.nome}')">✕</span>
        `;
        container.appendChild(chip);
    });
}

function atualizarTudo() {
    atualizarTotal();
    renderExames();
    renderSelecionados();
}

function atualizarTotal() {
    const total = selecionados.reduce((acc, i) => acc + (i.proc.valores[tipoSelecionado] * i.qtd), 0);
    document.getElementById("total").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("contador").innerText = selecionados.reduce((acc, i) => acc + i.qtd, 0);
}

function dispararToast(mensagem, tipo = "sucesso") {
    const toast = document.getElementById("toast");
    toast.classList.remove("mostrar");
    void toast.offsetWidth; 
    toast.className = "mostrar"; 
    if (tipo === "erro") toast.classList.add("erro");
    if (tipo === "aviso") toast.classList.add("aviso");
    toast.innerHTML = mensagem;
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => { toast.classList.remove("mostrar"); }, 2500);
}

function copiar() {
    const c = document.getElementById("resultado");
    if (!c.value) return dispararToast("Gere o orçamento primeiro!", "aviso");
    navigator.clipboard.writeText(c.value).then(() => dispararToast("✅ Copiado!"));
}

function limpar() {
    if (selecionados.length === 0) return;
    selecionados = [];
    const campo = document.getElementById("resultado");
    campo.value = "";
    campo.style.height = "120px";
    atualizarFrase();
    atualizarTudo();
    dispararToast("🗑️ Lista limpa", "aviso");
}

function mudarTipo(tipo, btn) {
    tipoSelecionado = tipo;
    document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    atualizarTudo();
}

function gerarOrcamento() {
    if (selecionados.length === 0) {
        dispararToast("⚠️ Selecione ao menos um exame primeiro!", "aviso");
        return;
    }
    let texto = "📝 *ORÇAMENTO DE EXAMES*\n\n";
    let totalGeral = 0;
    selecionados.forEach(item => {
        const valorUnitario = parseFloat(item.proc.valores[tipoSelecionado]);
        const subtotal = valorUnitario * item.qtd;
        totalGeral += subtotal;
        texto += `• ${item.proc.nome} (${item.qtd}x): R$ ${subtotal.toFixed(2)}\n`;
    });
    texto += `\n*TOTAL: R$ ${totalGeral.toFixed(2)}*`;
    const campoResultado = document.getElementById("resultado");
    campoResultado.value = texto;
    campoResultado.style.height = "auto"; 
    campoResultado.style.height = campoResultado.scrollHeight + "px"; 
    dispararToast("✨ Orçamento gerado!");
}

function filtrar() {
    const termo = document.getElementById("busca").value.toLowerCase().trim();
    const grupos = document.querySelectorAll(".categoria-group");
    grupos.forEach(grupo => {
        let temExameVisivel = false;
        const exames = grupo.querySelectorAll(".exame");
        exames.forEach(exame => {
            const nomeExame = exame.querySelector("span").innerText.toLowerCase();
            if (nomeExame.includes(termo)) {
                exame.style.display = "flex";
                temExameVisivel = true;
            } else {
                exame.style.display = "none";
            }
        });
        grupo.style.display = temExameVisivel ? "block" : "none";
    });
}

// --- ADMIN ---
const SENHA_CORRETA = "admin123"; 

function confirmarLogin() {
    const senhaDigitada = document.getElementById('senhaAdminInput').value;
    if (senhaDigitada === SENHA_CORRETA) {
        modoAdmin = true;
        const btnNovo = document.getElementById('btnNovoProcedimento');
        if (btnNovo) btnNovo.style.display = 'block';
        fecharModal();
        renderExames(); 
        dispararToast("🔓 Modo Administrador Ativado!");
    } else {
        dispararToast("❌ Senha incorreta!", "erro");
        document.getElementById('senhaAdminInput').value = "";
        document.getElementById('senhaAdminInput').focus();
    }
}

function sairAdministrador() {
    modoAdmin = false;
    const btnNovo = document.getElementById('btnNovoProcedimento');
    if (btnNovo) btnNovo.style.display = 'none';
    fecharModal();
    renderExames(); 
    dispararToast("🔒 Você saiu do modo administrador", "aviso");
}

function fecharModal() {
    const modais = document.querySelectorAll('.modal');
    modais.forEach(modal => { modal.style.display = 'none'; });
    const inputSenha = document.getElementById('senhaAdminInput');
    if (inputSenha) inputSenha.value = '';
}

function verificarAcessoAdmin() {
    const modal = document.getElementById('modalLoginAdmin');
    modal.style.display = 'flex';
    document.getElementById('senhaAdminInput').focus();
}

document.getElementById('senhaAdminInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') confirmarLogin();
});

window.onclick = function(event) {
    const modalLogin = document.getElementById('modalLoginAdmin');
    const modalAdmin = document.getElementById('modalAdmin');
    if (event.target == modalLogin || event.target == modalAdmin) fecharModal();
}

document.addEventListener('DOMContentLoaded', carregarDadosIniciais);