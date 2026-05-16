
const idMarceneiro = $('#IdMarceneiro').val();
let vendedores = [];
let lojas = [];
let modalInstance = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function () {
    modalInstance = new bootstrap.Modal(document.getElementById('CadVendedor'));
    carregarVendedores();
    carregarLojas();
});

// ===== CARREGAR VENDEDORES COM LOADING =====
async function carregarVendedores() {
    if (!idMarceneiro) return;

    // Mostrar loading na tabela
    const tbody = document.getElementById('tabelaVendedores');
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Carregando vendedores...<br><div class="spinner-border spinner-border-sm mt-2" role="status"></div></td></tr>`;

    try {
        const response = await fetch(`/ListarDadosVendedor?idMarceneiro=${idMarceneiro}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        vendedores = Array.isArray(data) ? data : [];
        renderizarTabela(vendedores);
    } catch (error) {
        console.error("Erro ao carregar vendedores:", error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar lista de vendedores',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        vendedores = [];
        renderizarTabela([]);
    }
}

// ===== CARREGAR LOJAS COM LOADING =====
async function carregarLojas() {
    if (!idMarceneiro) return;

    try {
        const response = await fetch(`/ListarDadosLoja?idMarceneiro=${idMarceneiro}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        lojas = Array.isArray(data) ? data : [];
        preencherDropdownLojas();
    } catch (error) {
        console.error("Erro ao carregar lojas:", error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar lista de lojas',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

function preencherDropdownLojas() {
    const select = document.getElementById('idloja');
    select.innerHTML = '<option value="0">Selecione uma loja...</option>';
    lojas.forEach(loja => {
        select.innerHTML += `<option value="${loja.idLoja}">${loja.razaosocial}</option>`;
    });
}

// ===== RENDERIZAR TABELA =====
function renderizarTabela(lista) {
    const tbody = document.getElementById('tabelaVendedores');

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum vendedor encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr>
        <td data-label="Nome">${item.nome || ''}</td>
        <td data-label="Telefone">${item.telefone || ''}</td>
        <td data-label="E-mail">${item.email || ''}</td>
        <td data-label="Ações">
        <div class="btn-group">
        <button class="btn btn-info btn-sm" onclick="location.href='/Vendedores/Orcamentos?idVendedor=${item.idVendedor}'" title="Ver Orçamentos">
        <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-info btn-sm" onclick="abrirModal(${item.idVendedor})" title="Editar">
        <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="excluirVendedor(${item.idVendedor})" title="Excluir">
        <i class="fas fa-trash"></i>
        </button>
        </div>
        </td>
        </tr>
        `).join('');
}

// ===== FILTRAR VENDEDORES =====
function filtrarVendedores() {
    const filtro = document.getElementById('filtroVendedores').value.toUpperCase();
    const filtrados = vendedores.filter(v =>
        (v.nome || '').toUpperCase().includes(filtro) ||
        (v.email || '').toUpperCase().includes(filtro) ||
        (v.telefone || '').includes(filtro)
    );
    renderizarTabela(filtrados);
}

// ===== ABRIR MODAL =====
function abrirModal(idVendedor) {
    if (idVendedor) {
        const vendedor = vendedores.find(v => v.idVendedor === idVendedor);
        if (vendedor) {
            document.getElementById('idVendedor').value = vendedor.idVendedor;
            document.getElementById('nome').value = vendedor.nome || '';
            document.getElementById('cpf').value = vendedor.cpf || '';
            document.getElementById('idloja').value = vendedor.idloja || 0;
            document.getElementById('telefone').value = vendedor.telefone || '';
            document.getElementById('email').value = vendedor.email || '';
        }
    } else {
        document.getElementById('idVendedor').value = 0;
        document.getElementById('nome').value = '';
        document.getElementById('cpf').value = '';
        document.getElementById('idloja').value = 0;
        document.getElementById('telefone').value = '';
        document.getElementById('email').value = '';
    }
    modalInstance.show();
}

// ===== GRAVAR DADOS COM LOADING =====
async function gravarDados() {
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();

    if (!nome || !telefone) {
        Swal.fire({
            title: 'Aviso',
            text: 'Preencha os campos obrigatórios (Nome e Telefone).',
            icon: 'info',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Mostrar loading
    Swal.fire({
        title: 'Gravando...',
        text: 'Salvando dados do vendedor',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const payload = {
        idVendedor: parseInt(document.getElementById('idVendedor').value) || 0,
        idMarceneiro: idMarceneiro,
        nome: nome,
        cpf: document.getElementById('cpf').value.trim(),
        idloja: parseInt(document.getElementById('idloja').value) || 0,
        telefone: telefone,
        email: document.getElementById('email').value.trim()
    };

    try {
        const response = await fetch('/SalvarDadosVendedor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        Swal.close();

        if (data.sucesso) {
            Swal.fire({
                title: 'Sucesso!',
                text: data.mensagem || 'Vendedor salvo com sucesso',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            modalInstance.hide();
            carregarVendedores();
        } else {
            Swal.fire({
                title: 'Erro!',
                text: data.mensagem || 'Erro ao salvar vendedor',
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

// ===== EXCLUIR VENDEDOR COM LOADING =====
function excluirVendedor(id) {
    Swal.fire({
        title: 'Confirmar exclusão?',
        text: 'Deseja excluir este Vendedor? Esta ação não poderá ser desfeita!',
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
                text: 'Processando exclusão do vendedor',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await fetch(`/ExcluirDadosVendedor?id=${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                Swal.close();

                if (data.sucesso) {
                    Swal.fire({
                        title: 'Excluído!',
                        text: data.mensagem || 'Vendedor excluído com sucesso',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    carregarVendedores();
                } else {
                    Swal.fire({
                        title: 'Erro!',
                        text: data.mensagem || 'Erro ao excluir vendedor',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                Swal.close();
                Swal.fire({
                    title: 'Erro!',
                    text: 'Erro ao excluir vendedor',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
}

// ===== MÁSCARAS =====
function mascaraCPF(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 11);
    if (v.length >= 4) {
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
    }
    if (v.length >= 7) {
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
    }
    if (v.length >= 10) {
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    input.value = v;
}

function mascaraTelefone(input) {
    let valor = input.value.replace(/\D/g, '').substring(0, 11);
    if (valor.length > 10) {
        input.value = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (valor.length > 5) {
        input.value = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (valor.length > 2) {
        input.value = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (valor.length > 0) {
        input.value = valor.replace(/^(\d*)/, '($1');
    } else {
        input.value = '';
    }
}