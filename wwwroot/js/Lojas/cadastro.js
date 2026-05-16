
const idMarceneiro = $('#IdMarceneiro').val();

// ===== INICIALIZAÇÃO =====
$(document).ready(function () {
    // Verifica se há ID na URL para edição
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id');
    if (idUrl) {
        carregarDados(idUrl);
    }
});

// ===== CARREGAR DADOS PARA EDIÇÃO COM LOADING =====
async function carregarDados(id) {
    // Mostrar loading
    Swal.fire({
        title: 'Carregando...',
        text: 'Buscando dados da loja',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`/CarregarDadosLoja?id=${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        // Fechar loading
        Swal.close();

        document.getElementById('idLoja').value = data.idLoja || 0;
        document.getElementById('razaosocial').value = data.razaosocial || '';
        document.getElementById('cnpj').value = data.cnpj || '';
        document.getElementById('telefone').value = data.telefone || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('cep').value = data.cep || '';
        document.getElementById('logradouro').value = data.logradouro || '';
        document.getElementById('numerologradouro').value = data.numerologradouro || '';
        document.getElementById('complemento').value = data.complemento || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.cidade || '';
        document.getElementById('estado').value = data.estado || '';

        // Mostrar mensagem de sucesso
        Swal.fire({
            title: 'Sucesso!',
            text: 'Dados carregados com sucesso',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        Swal.close();
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar dados da loja',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ===== EXCLUIR DADOS COM LOADING =====

// ===== SALVAR COM LOADING =====
async function salvar() {
    const razaosocial = document.getElementById('razaosocial').value.trim();
    const telefone = document.getElementById('telefone').value.trim();

    if (!razaosocial || !telefone) {
        Swal.fire({
            title: 'Aviso',
            text: 'Preencha os campos obrigatórios.',
            icon: 'info',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Mostrar loading
    Swal.fire({
        title: 'Gravando...',
        text: 'Salvando dados da loja',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const payload = {
        idLoja: parseInt(document.getElementById('idLoja').value) || 0,
        idmarceneiro: idMarceneiro,
        razaosocial: razaosocial,
        cnpj: document.getElementById('cnpj').value.trim(),
        telefone: telefone,
        email: document.getElementById('email').value.trim(),
        cep: document.getElementById('cep').value.trim(),
        logradouro: document.getElementById('logradouro').value.trim(),
        numerologradouro: document.getElementById('numerologradouro').value.trim(),
        complemento: document.getElementById('complemento').value.trim(),
        bairro: document.getElementById('bairro').value.trim(),
        cidade: document.getElementById('cidade').value.trim(),
        estado: document.getElementById('estado').value.trim()
    };

    try {
        const response = await fetch('/SalvarDadosLoja', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        Swal.close();

        if (data.codigo === 0) {
            Swal.fire({
                title: 'Sucesso!',
                text: data.mensagem || 'Loja salva com sucesso',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                location.href = '/Lojas';
            });
        } else {
            Swal.fire({
                title: 'Erro!',
                text: data.mensagem || 'Erro ao salvar loja',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            title: 'Erro!',
            text: 'Falha na conexão ao salvar',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ===== BUSCAR CEP (ViaCEP) COM LOADING =====
async function buscarCep() {
    const cepValue = document.getElementById('cep').value.replace(/\D/g, '');
    if (cepValue.length !== 8) return;

    // Mostrar loading
    Swal.fire({
        title: 'Buscando CEP...',
        text: 'Consultando endereço',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        const data = await response.json();

        Swal.close();

        if (!data.erro) {
            const estadosExtenso = {
                'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
                'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
                'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
                'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
                'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
                'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
                'SE': 'Sergipe', 'TO': 'Tocantins'
            };

            document.getElementById('logradouro').value = data.logradouro || '';
            document.getElementById('bairro').value = data.bairro || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('estado').value = estadosExtenso[data.uf] || data.uf || '';

            setEnderecoDisabled(true);

            Swal.fire({
                title: 'CEP encontrado!',
                text: 'Endereço preenchido automaticamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                title: 'CEP não encontrado',
                text: 'Preencha o endereço manualmente',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            setEnderecoDisabled(false);
        }
    } catch (error) {
        Swal.close();
        console.error('Erro ao buscar CEP:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Falha ao buscar o CEP',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        setEnderecoDisabled(false);
    }
}

function setEnderecoDisabled(disabled) {
    document.getElementById('logradouro').disabled = disabled;
    document.getElementById('bairro').disabled = disabled;
    document.getElementById('cidade').disabled = disabled;
    document.getElementById('estado').disabled = disabled;
}

// ===== MÁSCARAS =====
function mascaraCNPJ(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 14);
    if (v.length >= 3) {
        v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    }
    if (v.length >= 7) {
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    }
    if (v.length >= 11) {
        v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    }
    if (v.length >= 15) {
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
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

function mascaraCEP(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 8);
    if (v.length >= 3) {
        v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    }
    if (v.length >= 7) {
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2-$3');
    }
    input.value = v;
}