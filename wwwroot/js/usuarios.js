// === Variáveis globais (ou no escopo do módulo) ===
let usuarios = [];
let modalInstance = null;

// Captura o ID do marceneiro após o DOM carregar
let idMarceneiro = null;

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
    // Obtém o valor do campo (pode ser um input hidden ou text)
    const idMarceneiroInput = document.getElementById('IdMarceneiro');
    if (idMarceneiroInput) {
        idMarceneiro = idMarceneiroInput.value;
    }

    // Inicializa o modal do Bootstrap (assumindo que o elemento existe)
    const modalElement = document.getElementById('CadUsuario');
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement);
    }

    // Adiciona evento de filtro ao campo de busca
    const filtroInput = document.getElementById('filtroUsuarios');
    if (filtroInput) {
        filtroInput.addEventListener('keyup', filtrarUsuarios);
    }

    // Carrega a lista inicial
    carregarLista();
});

// === Função para carregar a lista de usuários via fetch ===
async function carregarLista() {
    if (!idMarceneiro) return;

    Swal.fire({
        title: 'Carregando...',
        text: 'Buscando lista de usuários',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch(`/ListarDadosUsuarioMarceneiro?idMarceneiro=${idMarceneiro}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        const sucesso = data.codigo === 0 || data.sucesso === true;
        if (!sucesso && data.mensagem) {
            Swal.fire('Erro', data.mensagem, 'error');
            usuarios = [];
        } else {
            usuarios = Array.isArray(data) ? data : (data.data || []);
        }

        renderizarTabela(usuarios);
        Swal.close();
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        Swal.fire('Erro', 'Não foi possível carregar os dados.', 'error');
        renderizarTabela([]);
    }
}

// === Renderiza a tabela com os dados ===
function renderizarTabela(lista) {
    const tbody = document.getElementById('tabelaUsuarios');
    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum usuário encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map((item, index) => `
        <tr>
            <td>${escapeHtml(item.usuario || item.email || '')}</td>
            <td>${escapeHtml(item.usuarioLogado || item.nomeExibicao || '-')}</td>
            <td>${item.ultimoAcesso || 'Nunca acessou'}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-info btn-sm" onclick="abrirModal(${item.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirUsuario(${item.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// === Escape de caracteres especiais para evitar XSS ===
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// === Filtro por e-mail ou nome ===
function filtrarUsuarios() {
    const filtroInput = document.getElementById('filtroUsuarios');
    const filtro = filtroInput ? filtroInput.value.toLowerCase() : '';
    const filtrados = usuarios.filter(u => {
        const email = (u.usuario || u.email || '').toLowerCase();
        const nome = (u.usuarioLogado || u.nomeExibicao || '').toLowerCase();
        return email.includes(filtro) || nome.includes(filtro);
    });
    renderizarTabela(filtrados);
}

// === Abre o modal para cadastro/edição ===
function abrirModal(id) {
    const idUsuarioField = document.getElementById('idUsuario');
    const emailField = document.getElementById('usuarioEmail');
    const senhaField = document.getElementById('senha');
    const confirmaField = document.getElementById('confirmarSenha');

    if (!idUsuarioField || !emailField || !senhaField || !confirmaField) return;

    if (id) {
        const user = usuarios.find(u => u.id === id);
        if (user) {
            idUsuarioField.value = user.id;
            emailField.value = user.usuario || user.email || '';
            senhaField.value = '';
            confirmaField.value = '';
        }
    } else {
        idUsuarioField.value = 0;
        emailField.value = '';
        senhaField.value = '';
        confirmaField.value = '';
    }

    if (modalInstance) modalInstance.show();
}

// === Salva (insere ou atualiza) o usuário ===
async function gravarDados() {
    const email = document.getElementById('usuarioEmail')?.value.trim() || '';
    const senha = document.getElementById('senha')?.value || '';
    const confirma = document.getElementById('confirmarSenha')?.value || '';
    const id = parseInt(document.getElementById('idUsuario')?.value) || 0;
    const isEditing = id !== 0;

    if (!email) {
        Swal.fire('Aviso', 'Preencha o e-mail do usuário.', 'info');
        return;
    }
    if (!isEditing && !senha) {
        Swal.fire('Aviso', 'Preencha a senha do usuário.', 'info');
        return;
    }
    if (senha && senha !== confirma) {
        Swal.fire('Aviso', 'As senhas não conferem.', 'info');
        return;
    }
    if (senha && senha.length < 6) {
        Swal.fire('Aviso', 'A senha deve ter no mínimo 6 caracteres.', 'info');
        return;
    }

    Swal.fire({
        title: 'Gravando...',
        text: 'Por favor, aguarde',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch('/SalvarDadosUsuarioMarceneiro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Id: id,
                Idmarceneiro: parseInt(idMarceneiro),
                Usuario: email,
                Senha: senha
            })
        });
        const data = await response.json();
        const sucesso = data.codigo === 0 || data.sucesso === true;

        if (sucesso) {
            if (modalInstance) modalInstance.hide();
            await Swal.fire({
                title: 'Sucesso!',
                text: data.mensagem || 'Usuário salvo com sucesso!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            carregarLista();
        } else {
            Swal.fire('Erro', data.mensagem || 'Erro ao salvar usuário', 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Falha na comunicação com o servidor.', 'error');
    }
}

// === Exclui um usuário após confirmação ===
function excluirUsuario(id) {
    Swal.fire({
        title: 'Excluir Usuário?',
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
                didOpen: () => Swal.showLoading()
            });

            try {
                const response = await fetch(`/ExcluirDadosUsuarioMarceneiro?id=${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                const sucesso = data.codigo === 0 || data.sucesso === true;

                if (sucesso) {
                    await Swal.fire({
                        title: 'Excluído!',
                        text: data.mensagem || 'Usuário excluído com sucesso!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    carregarLista();
                } else {
                    Swal.fire('Erro', data.mensagem || 'Erro ao excluir usuário', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Erro', 'Erro ao processar exclusão.', 'error');
            }
        }
    });
}