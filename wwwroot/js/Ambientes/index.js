
const idMarceneiro = $('#IdMarceneiro').val();
let ambientes = [];

// ===== INICIALIZAÇÃO =====
$(document).ready(function () {
    carregarAmbientes();
});

// ===== CARREGAR LISTA COM LOADING =====
async function carregarAmbientes() {
    if (!idMarceneiro) return;

    // Mostrar loading na tabela
    const tbody = document.getElementById('tabelaAmbientes');
    tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">Carregando ambientes...<br><div class="spinner-border spinner-border-sm mt-2" role="status"></div></td></tr>`;

    try {
        const response = await fetch(`/ListarDadosAmbiente?idMarceneiro=${idMarceneiro}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        // Verificar se retornou erro
        if (data.codigo === 1) {
            Swal.fire({
                title: 'Erro!',
                text: data.mensagem || 'Erro ao carregar ambientes',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            ambientes = [];
        } else {
            ambientes = Array.isArray(data) ? data : [];
        }

        renderizarTabela(ambientes);
    } catch (error) {
        console.error("Erro ao carregar ambientes:", error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar lista de ambientes',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        ambientes = [];
        renderizarTabela([]);
    }
}

// ===== RENDERIZAR TABELA =====
function renderizarTabela(lista) {
    const tbody = document.getElementById('tabelaAmbientes');

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">Nenhum ambiente encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
        <td data-label="Nome">${item.nome || item.Nome || ''}</td>
        <td data-label="Ações">
        <div class="btn-group">
        <button class="btn btn-info btn-sm" onclick="location.href='/Ambientes/Cadastro?id=${item.id || item.Id}'" title="Editar">
        <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="excluirAmbiente(${item.id || item.Id})" title="Excluir">
        <i class="fas fa-trash"></i>
        </button>
        </div>
        </td>
        </tr>
        `).join('');
}

// ===== FILTRAR AMBIENTES =====
function filtrarAmbientes() {
    const filtro = document.getElementById('filtroAmbientes').value.toUpperCase();
    const filtrados = ambientes.filter(a => {
        const nome = a.nome || a.Nome || '';
        return nome.toUpperCase().includes(filtro);
    });
    renderizarTabela(filtrados);
}

// ===== EXCLUIR AMBIENTE COM LOADING =====
function excluirAmbiente(id) {
    Swal.fire({
        title: 'Confirmar exclusão?',
        text: 'Deseja excluir este Ambiente? Esta ação não poderá ser desfeita!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
                title: 'Excluindo...',
                text: 'Processando exclusão do ambiente',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await fetch(`/ExcluirDadosAmbiente?id=${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                Swal.close();

                // Verificar o padrão de retorno (codigo ou sucesso)
                const sucesso = data.codigo === 0 || data.sucesso === true;
                const mensagem = data.mensagem || (sucesso ? 'Ambiente excluído com sucesso' : 'Erro ao excluir ambiente');

                if (sucesso) {
                    Swal.fire({
                        title: 'Excluído!',
                        text: mensagem,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    carregarAmbientes();
                } else {
                    Swal.fire({
                        title: 'Erro!',
                        text: mensagem,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                Swal.close();
                Swal.fire({
                    title: 'Erro!',
                    text: 'Erro na comunicação com o servidor',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
}

// ===== FUNÇÃO PARA RECARREGAR LISTA (útil para quando voltar do cadastro) =====
function recarregarLista() {
    carregarAmbientes();
}

// Verificar se veio parâmetro de recarregamento na URL
$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reload') === 'true') {
        carregarAmbientes();
    }
});