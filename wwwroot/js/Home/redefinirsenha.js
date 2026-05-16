// Elementos DOM
const senhaInput = document.getElementById('senha');
const confirmarInput = document.getElementById('confirmarSenha');
const btnRedefinir = document.getElementById('btnRedefinir');
const btnVoltar = document.getElementById('btnVoltar');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const matchFeedback = document.getElementById('matchFeedback');
const mensagemDiv = document.getElementById('mensagemAlerta');

// Estado
let requisitos = {
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
};

let loading = false;
let token = null;

// Obter token da URL
function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
}

// Validar senha e atualizar requisitos visuais
function validarRequisitos(senha) {
    const novosRequisitos = {
        length: senha.length >= 8,
        upper: /[A-Z]/.test(senha),
        lower: /[a-z]/.test(senha),
        number: /\d/.test(senha),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(senha)
    };
    requisitos = novosRequisitos;

    // Atualizar UI dos requisitos
    document.querySelectorAll('.requirement').forEach(el => {
        const reqType = el.getAttribute('data-req');
        const isValid = requisitos[reqType];
        const icon = el.querySelector('i');
        const textSpan = el.querySelector('span');
        if (isValid) {
            el.classList.add('valid');
            el.classList.remove('invalid');
            icon.className = 'fas fa-check-circle';
        } else {
            el.classList.add('invalid');
            el.classList.remove('valid');
            icon.className = 'fas fa-circle';
        }
    });

    // Calcular força da senha
    const forca = Object.values(requisitos).filter(Boolean).length;
    let width = '0%', classe = '', texto = '';
    if (senha.length === 0) {
        width = '0%';
        texto = '';
    } else if (forca <= 2) {
        width = '25%';
        classe = 'strength-weak';
        texto = 'Senha fraca';
    } else if (forca <= 3) {
        width = '50%';
        classe = 'strength-medium';
        texto = 'Senha média';
    } else if (forca === 4) {
        width = '75%';
        classe = 'strength-strong';
        texto = 'Senha forte';
    } else {
        width = '100%';
        classe = 'strength-very-strong';
        texto = 'Senha muito forte';
    }

    strengthBar.style.width = width;
    strengthBar.className = `strength-bar ${classe}`;
    strengthText.textContent = texto;
    strengthText.className = `strength-text ${classe}-text`;

    // Validar confirmação
    validarConfirmacao();
    atualizarBotao();
}

// Validar se as senhas coincidem
function validarConfirmacao() {
    const senha = senhaInput.value;
    const confirmar = confirmarInput.value;
    if (confirmar === '') {
        matchFeedback.textContent = '';
        return;
    }
    const coincide = senha === confirmar;
    matchFeedback.textContent = coincide ? 'Senhas coincidem' : 'Senhas não coincidem';
    matchFeedback.className = `strength-text ${coincide ? 'strength-very-strong-text' : 'strength-weak-text'}`;
    return coincide;
}

// Verificar se o formulário é válido
function isFormValido() {
    return Object.values(requisitos).every(Boolean) &&
        senhaInput.value === confirmarInput.value &&
        senhaInput.value !== '' &&
        token !== null;
}

// Ativar/desativar botão conforme validade
function atualizarBotao() {
    btnRedefinir.disabled = !isFormValido() || loading;
}

// Mostrar mensagem de feedback (sucesso/erro)
function mostrarMensagem(texto, tipo) {
    mensagemDiv.style.display = 'block';
    mensagemDiv.innerHTML = `
        <div class="alert alert-${tipo}">
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
            ${texto}
        </div>
    `;
    // Auto-esconder após 5s se não for erro crítico
    if (tipo !== 'danger') {
        setTimeout(() => {
            if (mensagemDiv) mensagemDiv.style.display = 'none';
        }, 5000);
    }
}

// Limpar mensagem
function limparMensagem() {
    mensagemDiv.style.display = 'none';
    mensagemDiv.innerHTML = '';
}

// Redefinir senha (chamada à API)
async function handleRedefinir(event) {
    event.preventDefault();
    if (loading) return;
    if (!isFormValido()) return;

    loading = true;
    atualizarBotao();
    const textoOriginalBtn = btnRedefinir.innerHTML;
    btnRedefinir.innerHTML = '<div class="loading me-2"></div><span>Alterando...</span>';

    limparMensagem();
    mostrarMensagem('Processando redefinição de senha...', 'info');

    try {
        const response = await fetch('/RedefinirSenha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                TokenRecuperacaoAcesso: token,
                Senha: senhaInput.value
            })
        });

        const data = await response.json();

        if (response.ok && data.sucesso === true) {
            mostrarMensagem(data.mensagem || 'Senha redefinida com sucesso! Redirecionando...', 'success');
            setTimeout(() => {
                window.location.href = '/Home/Login';
            }, 3000);
        } else {
            const erroMsg = data.mensagem || 'Erro ao redefinir a senha. Tente novamente.';
            mostrarMensagem(erroMsg, 'danger');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarMensagem('Erro de conexão com o servidor. Verifique sua internet e tente novamente.', 'danger');
    } finally {
        loading = false;
        atualizarBotao();
        btnRedefinir.innerHTML = textoOriginalBtn;
    }
}

// Eventos
senhaInput.addEventListener('input', (e) => validarRequisitos(e.target.value));
confirmarInput.addEventListener('input', () => {
    validarConfirmacao();
    atualizarBotao();
});
btnRedefinir.addEventListener('click', handleRedefinir);
btnVoltar.addEventListener('click', () => {
    window.location.href = '/Login';
});

// Inicialização
token = getTokenFromUrl();
if (!token) {
    mostrarMensagem('Token de redefinição não encontrado. Solicite uma nova redefinição de senha.', 'danger');
    btnRedefinir.disabled = true;
} else {
    // token presente – aguarda input do usuário
    validarRequisitos(''); // reset visual
}