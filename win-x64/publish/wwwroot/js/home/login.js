function togglePassword() {
    const senhaInput = document.getElementById('senha');
    const eyeIcon = document.getElementById('eyeIcon');
    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        senhaInput.type = 'password';
        eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

async function realizarLogin(event) {
    event.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const btnEntrar = document.getElementById('btnEntrar');

    Swal.fire({
        title: 'Autenticando...',
        text: 'Por favor, aguarde',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    btnEntrar.disabled = true;

    try {
        const response = await fetch('/RealizarLoginMarceneiro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        const data = await response.json();

        if (data.status === 'sucesso') {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: data.message,
                showConfirmButton: false,
                timer: 1200
            }).then(() => {
                window.location.href = '/Home';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Ops!',
                text: data.mensagem || 'Usuário ou senha inválidos.',
                confirmButtonText: 'Tentar novamente'
            });
            btnEntrar.disabled = false;
        }
    } catch (error) {
        Swal.fire({
            icon: 'warning',
            title: 'Erro de Conexão',
            text: 'Não foi possível conectar ao servidor.',
            confirmButtonText: 'Ok'
        });
        btnEntrar.disabled = false;
    }
}