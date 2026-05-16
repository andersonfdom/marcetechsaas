
const idMarceneiro = $('#IdMarceneiro').val();
let lojas = [];

// ===== INICIALIZAÇÃO =====
$(document).ready(function () {
    carregarLojas();
});

// ===== CARREGAR LISTA COM LOADING SWAL =====
async function carregarLojas() {
    if (!idMarceneiro) return;

    Swal.fire({
        title: 'Carregando Lojas...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`/ListarDadosLoja?idMarceneiro=${idMarceneiro}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (Array.isArray(data)) {
            lojas = data;
        } else if (data && Array.isArray(data.data)) {
            lojas = data.data;
        } else {
            lojas = [];
        }

        renderizarTabela(lojas);
        Swal.close(); // Fecha o loading após renderizar
    } catch (error) {
        console.error("Erro ao carregar lojas:", error);
        lojas = [];
        renderizarTabela([]);
        Swal.fire('Erro', 'Não foi possível buscar os dados das lojas.', 'error');
    }
}

// ===== RENDERIZAR TABELA =====
function renderizarTabela(lista) {
    const tbody = document.getElementById('tabelaLojas');

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhuma loja encontrada.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
        <td data-label="Razão Social">${item.razaosocial || ''}</td>
        <td data-label="Telefone">${item.telefone || ''}</td>
        <td data-label="E-mail">${item.email || ''}</td>
        <td data-label="Ações">
        <div class="btn-group">
        <button class="btn btn-info btn-sm" onclick="location.href='/Lojas/Cadastro?id=${item.idLoja}'" title="Editar">
        <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="excluirLoja(${item.idLoja})" title="Excluir">
        <i class="fas fa-trash"></i>
        </button>
        </div>
        </td>
        </tr>
        `).join('');
}

// ===== FILTRAR LOJAS =====
function filtrarLojas() {
    const filtro = document.getElementById('filtroLojas').value.toUpperCase();
    const filtradas = lojas.filter(l =>
        (l.razaosocial || '').toUpperCase().includes(filtro) ||
        (l.email || '').toUpperCase().includes(filtro) ||
        (l.telefone || '').includes(filtro)
    );
    renderizarTabela(filtradas);
}

// ===== EXCLUIR LOJA COM CONFIRMAÇÃO E LOADING =====
function excluirLoja(id) {
    Swal.fire({
        title: 'Excluir Loja?',
        text: 'Tem certeza que deseja excluir esta Loja? Esta ação é irreversível.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {

            // Mostra o Loading de exclusão
            Swal.fire({
                title: 'Excluindo...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await fetch(`/ExcluirDadosLoja?id=${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                if (data.sucesso) {
                    await Swal.fire({
                        title: 'Sucesso!',
                        text: data.mensagem,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    carregarLojas();
                } else {
                    Swal.fire('Erro', data.mensagem || 'Erro ao excluir', 'error');
                }
            } catch (error) {
                Swal.fire('Erro', 'Houve uma falha ao tentar excluir a loja.', 'error');
            }
        }
    });
}