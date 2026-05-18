
const idMarceneiro = $('#IdMarceneiro').val();
let categorias = [];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function () {
    carregarCategorias();
});

// ===== CARREGAR LISTA COM LOADING =====
async function carregarCategorias() {
    if (!idMarceneiro) return;

    // Mostrar loading na tabela
    const tbody = document.getElementById('tabelaCategorias');
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Carregando categorias...<br><div class="spinner-border spinner-border-sm mt-2" role="status"></div></td></tr>`;

    try {
        const response = await fetch(`/ListarDadosCategoria?idMarceneiro=${idMarceneiro}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        // Verificar se retornou erro
        if (data.codigo === 1) {
            Swal.fire({
                title: 'Erro!',
                text: data.mensagem || 'Erro ao carregar categorias',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            categorias = [];
        } else {
            categorias = Array.isArray(data) ? data : [];
        }

        renderizarTabela(categorias);
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar lista de categorias',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        categorias = [];
        renderizarTabela([]);
    }
}

// ===== RENDERIZAR TABELA =====
function renderizarTabela(lista) {
    const tbody = document.getElementById('tabelaCategorias');

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhuma categoria encontrada.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
        <td data-label="Nome">${item.nome || item.Nome || ''}</td>
        <td data-label="Unidade">${item.unidadePadrao || item.UnidadePadrao || ''}</td>
        <td data-label="Fórmula">${item.formulaCalculo || item.FormulaCalculo || ''}</td>
        <td data-label="Ações">
        <div class="btn-group">
        <button class="btn btn-info btn-sm" onclick="location.href='/Categorias/Cadastro?id=${item.id || item.Id}'" title="Editar">
        <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="excluirCategoria(${item.id || item.Id})" title="Excluir">
        <i class="fas fa-trash"></i>
        </button>
        </div>
        </td>
        </tr>
        `).join('');
}

// ===== FILTRAR CATEGORIAS =====
function filtrarCategorias() {
    const filtro = document.getElementById('filtroCategorias').value.toUpperCase();
    const filtrados = categorias.filter(c => {
        const nome = c.nome || c.Nome || '';
        const unidade = c.unidadePadrao || c.UnidadePadrao || '';
        const formula = c.formulaCalculo || c.FormulaCalculo || '';
        return nome.toUpperCase().includes(filtro) ||
            unidade.toUpperCase().includes(filtro) ||
            formula.toUpperCase().includes(filtro);
    });
    renderizarTabela(filtrados);
}

// ===== EXCLUIR CATEGORIA COM LOADING =====
function excluirCategoria(id) {
    Swal.fire({
        title: 'Confirmar exclusão?',
        text: 'Deseja excluir esta Categoria? Esta ação não poderá ser desfeita!',
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
                text: 'Processando exclusão da categoria',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await fetch(`/ExcluirDadosCategoria?id=${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                Swal.close();

                // Verificar o padrão de retorno (codigo ou sucesso)
                const sucesso = data.codigo === 0 || data.sucesso === true;
                const mensagem = data.mensagem || (sucesso ? 'Categoria excluída com sucesso' : 'Erro ao excluir categoria');

                if (sucesso) {
                    Swal.fire({
                        title: 'Excluído!',
                        text: mensagem,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    carregarCategorias();
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
    carregarCategorias();
}

// Verificar se veio parâmetro de recarregamento na URL
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reload') === 'true') {
        carregarCategorias();
    }
});