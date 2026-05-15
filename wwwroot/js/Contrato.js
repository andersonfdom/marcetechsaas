// Máscaras simples
function mascaraCpfCnpj(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 11) {
        input.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
        input.value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}
function mascaraTelefone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 11) {
        input.value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else {
        input.value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
}
function mascaraCep(input) {
    let value = input.value.replace(/\D/g, '');
    input.value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Preencher data atual
function preencherDataAtual() {
    const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    document.querySelectorAll('.data-contrato').forEach(el => el.innerText = hoje);
}

// Gravar dados do modal e atualizar visualização
function gravarDadosContrato() {
    Swal.fire({
        title: 'Aguarde...',
        text: 'Gravando dados Contrato',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    var dto = {
        idContrato: parseInt(document.getElementById('idContrato')?.value) || 0,
        idOrcamentoContrato: parseInt(document.getElementById('idOrcamentoContrato')?.value) || 0,
        nomeClienteContrato: document.getElementById('nomeclientecontrato')?.value || '',
        cpfClienteContrato: document.getElementById('cpfclientecontrato')?.value || '',
        telefoneClienteContrato: document.getElementById('telefoneclientecontrato')?.value || '',
        enderecoClienteContrato: document.getElementById('enderecoclientecontrato')?.value || '',
        cepClienteContrato: document.getElementById('cepclientecontrato')?.value || '',
        arquitetoContrato: document.getElementById('arquitetocontrato')?.value || '',

        // Tratamento importante para Booleans e Numbers
        pagamentoRtContrato: document.getElementById('pagamentortcontrato')?.checked || false,
        valorRtContrato: parseFloat(document.getElementById('valorrtcontrato')?.value) || 0,
        pontuacaoArchiContrato: document.getElementById('pontuacaoarchicontrato')?.checked || false,

        chavePixContrato: document.getElementById('chavepixcontrato')?.value || '',
        prazosContrato: tinymce.get('prazoscontrato').getContent(),
        descricaoFormaPagamentoContrato: tinymce.get('descricaoformapagamentocontrato').getContent()
    };

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/SalvarDadosContrato", false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            Swal.close();
            var retornoApi = JSON.parse(xmlhttp.responseText);

            if (retornoApi.sucesso === true) {
                Swal.fire({
                    title: retornoApi.mensagem,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    fecharModal();
                    window.location.reload();
                });
            } else {
                Swal.fire({ title: retornoApi.mensagem, icon: "error", timer: 2000, showConfirmButton: false })
                    .then(() => { return; });
            }
        }
    };

    xmlhttp.send(JSON.stringify(dto));
}

function abrirModal() {
    // Carregar dados atuais nos campos do modal
    $('#modalContrato').modal('show');
}

function fecharModal() {
    $('#modalContrato').modal('hide');
}

function handleDownload() {
    const element = document.getElementById('template-contrato-pdf');
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `contrato_orcamento_${new Date().toISOString().slice(0, 19)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function CarregarDadosContrato(idOrcamento) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/CarregarDadosContrato?idOrcamento=" + idOrcamento, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var retornoApi = JSON.parse(xmlhttp.responseText);

            console.log(retornoApi);
            atribuirElementoHTML('view-marceneiro-nome', retornoApi.nomeMarceneiro);

            if (retornoApi.tipoPessoaMarceneiro === 1) {
                atribuirElementoHTML('view-marceneiro-label-doc',"CNPJ");
            } else {
                atribuirElementoHTML('view-marceneiro-label-doc', "CPF");
            }

            const estadosExtenso = {
                'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
                'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
                'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
                'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
                'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
                'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
                'SE': 'Sergipe', 'TO': 'Tocantins'
            };


            //Contratada
            atribuirElementoHTML('view-marceneiro-doc', retornoApi.cpfCnpjMarceneiro);
            document.getElementById("view-logo").src = "data:image/jpeg;base64," + retornoApi.logo;
            atribuirElementoHTML('view-marceneiro-email', retornoApi.emailMarceneiro);
            atribuirElementoHTML('view-marceneiro-tel', retornoApi.telefoneMarceneiro);
            atribuirElementoHTML('view-marceneiro-endereco', "com sede na " + retornoApi.enderecoCompletoMarceneiro + "," + retornoApi.cepMarceneiro);
            atribuirElementoHTML('view-marceneiro-endereco2', "Telefone: " + retornoApi.telefoneMarceneiro + ", Estado do " + estadosExtenso[retornoApi.estadoMarceneiro] || retornoApi.estadoMarceneiro || '');

            //Contratante
            document.getElementById("view-cliente-nome").textContent = retornoApi.nomeCliente;
            document.getElementById("view-cliente-doc").textContent = retornoApi.cpfCnpjCliente;
            document.getElementById("view-cliente-endereco").textContent = retornoApi.enderecoCliente;
            atribuirElementoHTML('dosprazos', retornoApi.prazoEntrega);

            atribuirElementoHTML('cidadeComarca', retornoApi.cidadeComarca + "/" + retornoApi.estadoComarca);
        }
    };

    xmlhttp.send();
}

// Inicialização
window.onload = function () {
    preencherDataAtual();
    initEditorsContrato();

    var idOrcamentoContrato = document.getElementById('idOrcamentoContrato')?.value;

    CarregarDadosOrcamentoContrato(idOrcamentoContrato);

    var idContrato = document.getElementById("idContrato").value;

    if (idContrato === 0 || idContrato === '0') {
        abrirModal();
    } else {
        CarregarDadosContrato(idOrcamentoContrato);
    }
};

function CarregarDadosOrcamentoContrato(idOrcamentoContrato) {

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/CarregarDadosOrcamentoContrato?idOrcamento=" + idOrcamentoContrato, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var retornoApi = JSON.parse(xmlhttp.responseText);

            atribuirCampo('nomeclientecontrato', retornoApi.nomeclientecontrato);
            atribuirCampo('telefoneclientecontrato', retornoApi.telefoneclientecontrato);
            atribuirCampo('arquitetocontrato', retornoApi.arquitetocontrato);
            atribuirCampo('valorrtcontrato', retornoApi.valorrtcontrato);
            atribuirCampo('idContrato', retornoApi.idcontrato);
        }
    };

    xmlhttp.send();
}

function atribuirCampo(campo,valor) {
    document.getElementById(campo).value = valor;
}

function atribuirElementoHTML(campo, valor) {
    document.getElementById(campo).innerHTML = valor;
}

function voltar() {
    window.location.href = "/Orcamentos/Visualizar?id=" + document.getElementById('idOrcamentoContrato')?.value;
}

function initEditorsContrato() {
    tinymce.init({
        selector: '#prazoscontrato, #descricaoformapagamentocontrato',
        height: 250,
        menubar: false,
        language: 'pt_BR',
        plugins: 'lists link image table code wordcount',
        toolbar: 'undo redo | blocks | bold italic underline forecolor | alignleft aligncenter alignright | bullist numlist | table image code removeformat',
        branding: false,
        promotion: false,
        setup: function (editor) {
            editor.on('init', function () {
            });
        }
    });
}
