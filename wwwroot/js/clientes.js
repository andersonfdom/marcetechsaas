const idMarceneiro = $('#IdMarceneiro').val();
let clientes = [];
let modalInstance = null;

document.addEventListener('DOMContentLoaded', function () {
    modalInstance = new bootstrap.Modal(document.getElementById('CadCliente'));
    carregarLista();
});

// ===== CARREGAR LISTA COM LOADING =====
async function carregarLista() {
    if (!idMarceneiro) return;

    Swal.fire({
        title: 'Carregando...',
        text: 'Buscando lista de clientes',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`/ListarDadosCliente?idMarceneiro=${idMarceneiro}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        clientes = Array.isArray(data) ? data : (data.data || []);

        renderizarTabela(clientes);
        Swal.close();
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        Swal.fire('Erro', 'Não foi possível carregar os dados.', 'error');
    }
}

function renderizarTabela(lista) {
    const tbody = document.getElementById('tabelaClientes');
    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum cliente encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
        <td>${item.nome || ''}</td>
        <td>${item.telefone || ''}</td>
        <td>${item.email || ''}</td>
        <td>
        <div class="btn-group">
        <button class="btn btn-info btn-sm" onclick="abrirModal(${item.idCliente})" title="Editar">
        <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="excluirCliente(${item.idCliente})" title="Excluir">
        <i class="fas fa-trash"></i>
        </button>
        </div>
        </td>
        </tr>
        `).join('');
}

function filtrarClientes() {
    const filtro = document.getElementById('filtroClientes').value.toUpperCase();
    const filtrados = clientes.filter(c =>
        (c.nome || '').toUpperCase().includes(filtro) ||
        (c.email || '').toUpperCase().includes(filtro) ||
        (c.telefone || '').includes(filtro)
    );
    renderizarTabela(filtrados);
}

function abrirModal(idCliente) {
    if (idCliente) {
        const cliente = clientes.find(c => c.idCliente === idCliente);
        if (cliente) {
            document.getElementById('idCliente').value = cliente.idCliente;
            document.getElementById('nome').value = cliente.nome || '';
            document.getElementById('telefone').value = cliente.telefone || '';
            document.getElementById('email').value = cliente.email || '';
        }
    } else {
        document.getElementById('idCliente').value = 0;
        document.getElementById('nome').value = '';
        document.getElementById('telefone').value = '';
        document.getElementById('email').value = '';
    }
    modalInstance.show();
}

// ===== GRAVAR DADOS COM LOADING =====
async function gravarDados() {
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const email = document.getElementById('email').value.trim();
    const idCliente = parseInt(document.getElementById('idCliente').value) || 0;

    if (!nome || !telefone) {
        Swal.fire('Aviso', 'Preencha os campos obrigatórios (Nome e Telefone).', 'info');
        return;
    }

    Swal.fire({
        title: 'Gravando...',
        text: 'Por favor, aguarde',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch('/SalvarDadosCliente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idCliente, idMarceneiro, nome, telefone, email })
        });

        const data = await response.json();

        if (data.sucesso) {
            modalInstance.hide();
            await Swal.fire({
                title: 'Sucesso!',
                text: data.mensagem,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            carregarLista();
        } else {
            Swal.fire('Erro', data.mensagem || 'Erro ao salvar', 'error');
        }
    } catch (error) {
        Swal.fire('Erro', 'Falha na comunicação com o servidor.', 'error');
    }
}

// ===== EXCLUIR CLIENTE COM CONFIRMAÇÃO E LOADING =====
function excluirCliente(id) {
    Swal.fire({
        title: 'Excluir Cliente?',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {

            Swal.fire({
                title: 'Excluindo...',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await fetch(`/ExcluirDadosCliente?id=${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                if (data.sucesso) {
                    await Swal.fire({
                        title: 'Excluído!',
                        text: data.mensagem,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    carregarLista();
                } else {
                    Swal.fire('Erro', data.mensagem || 'Erro ao excluir', 'error');
                }
            } catch (error) {
                Swal.fire('Erro', 'Erro ao processar exclusão.', 'error');
            }
        }
    });
}

function mascaraTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    if (valor.length > 10) {
        input.value = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (valor.length > 5) {
        input.value = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (valor.length > 2) {
        input.value = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (valor.length > 0) {
        input.value = valor.replace(/^(\d*)/, '($1');
    }
}