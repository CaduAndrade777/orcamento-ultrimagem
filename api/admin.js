// admin.js - Gerenciamento do Painel Administrativo

let examesData = []; // Armazenará os dados vindos do servidor

// 1. CARREGAR DADOS AO INICIAR
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
});

async function carregarDados() {
    const listaAdmin = document.getElementById('listaAdmin');
    listaAdmin.innerHTML = '<tr><td colspan="7" style="text-align:center">Carregando exames...</td></tr>';

    try {
        // No futuro, isso será: fetch('http://seu-ip-local:8000/exames')
        // Por enquanto, simulando a estrutura que você já usa
        const response = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get' })
        });

        const data = await response.json();
        
        if (data) {
            examesData = data;
            renderizarTabela();
        }
    } catch (error) {
        mostrarToast("Erro ao carregar dados", "erro");
        console.error(error);
    }
}

// 2. RENDERIZAR TABELA COM O NOVO VISUAL
function renderizarTabela() {
    const listaAdmin = document.getElementById('listaAdmin');
    
    if (examesData.length === 0) {
        listaAdmin.innerHTML = '<tr><td colspan="7" style="text-align:center">Nenhum exame cadastrado.</td></tr>';
        return;
    }

    listaAdmin.innerHTML = examesData.map((exame, index) => `
        <tr>
            <td><span class="categoria-tag">${exame.categoria}</span></td>
            <td><strong>${exame.nome}</strong></td>
            <td><input type="number" class="input-inline" value="${exame.particular}" onchange="atualizarValor(${index}, 'particular', this.value)"></td>
            <td><input type="number" class="input-inline" value="${exame.desconto}" onchange="atualizarValor(${index}, 'desconto', this.value)"></td>
            <td><input type="number" class="input-inline" value="${exame.especial}" onchange="atualizarValor(${index}, 'especial', this.value)"></td>
            <td><input type="number" class="input-inline" value="${exame.prefeitura}" onchange="atualizarValor(${index}, 'prefeitura', this.value)"></td>
            <td>
                <button onclick="excluirExame(${index})" class="btn-perigo-sm" title="Excluir">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// 3. ATUALIZAR VALORES LOCALMENTE
function atualizarValor(index, campo, valor) {
    examesData[index][campo] = parseFloat(valor) || 0;
}

// 4. SALVAR TUDO NO SERVIDOR (COM FEEDBACK VISUAL)
async function salvarTudo() {
    const btnSalvar = document.querySelector('.btn-principal');
    const senha = prompt("Digite a senha master para salvar as alterações:");

    if (!senha) return;

    // Feedback de carregamento
    const textoOriginal = btnSalvar.innerText;
    btnSalvar.innerText = "SALVANDO...";
    btnSalvar.disabled = true;

    try {
        const response = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'save', 
                password: senha, 
                data: examesData 
            })
        });

        const result = await response.json();

        if (result.status === 'ok') {
            mostrarToast("Alterações salvas com sucesso!");
        } else {
            throw new Error(result.error || "Erro ao salvar");
        }
    } catch (error) {
        mostrarToast(error.message, "erro");
    } finally {
        btnSalvar.innerText = textoOriginal;
        btnSalvar.disabled = false;
    }
}

// 5. EXCLUIR EXAME (LOCAL)
function excluirExame(index) {
    if (confirm(`Deseja realmente excluir "${examesData[index].nome}"?`)) {
        examesData.splice(index, 1);
        renderizarTabela();
        mostrarToast("Exame removido da lista. Não esqueça de salvar!");
    }
}

// 6. UTILITÁRIO DE NOTIFICAÇÃO (TOAST)
function mostrarToast(mensagem, tipo = "sucesso") {
    const toast = document.getElementById('toast');
    toast.innerText = mensagem;
    toast.style.background = tipo === "erro" ? "#ef4444" : "#22c55e";
    toast.classList.add('mostrar');
    
    setTimeout(() => {
        toast.classList.remove('mostrar');
    }, 3000);
}