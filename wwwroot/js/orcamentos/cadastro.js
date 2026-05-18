// ===== INICIALIZAÇÃO APÓS DOM CARREGADO =====
document.addEventListener('DOMContentLoaded', function () {
    // Máscara para campos com classe .valorDecimal
    document.querySelectorAll('.valorDecimal').forEach(function (element) {
        element.addEventListener('input', function () {
            this.value = this.value
                .replace(/[^0-9.,]/g, "")
                .replace(/([.,]).*?\1/g, "$1");
        });
    });

    // Captura os valores dos campos
    const idMarceneiro = document.getElementById('IdMarceneiro')?.value || '';
    const idOrcamento = document.getElementById('idOrcamento')?.value || '0';

    initEditors(idMarceneiro);

    ListarDadosCliente(idMarceneiro);
    ListarDadosVendedor(idMarceneiro);
    ListarDadosLoja(idMarceneiro);

    if (idOrcamento !== '0') {
        CarregarDadosOrcamento(idOrcamento);
        ListarDadosAmbienteOrcamento(idOrcamento);
    }
});

// ===== LISTAR CLIENTES =====
function ListarDadosCliente(idMarceneiro, callback) {
    const idcliente = document.getElementById('idcliente');
    if (!idcliente) return;

    let dadosidcliente = "";
    idcliente.innerHTML = dadosidcliente;

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/ListarDadosCliente?idMarceneiro=" + idMarceneiro;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                const retornoApi = JSON.parse(xmlhttp.responseText);
                retornoApi.forEach(function (dados) {
                    dadosidcliente += `<option value="${dados.idCliente}">${escapeHtml(dados.nome)}</option>`;
                });
                idcliente.innerHTML = dadosidcliente;

                if (callback) callback();
            } else {
                Swal.fire("Erro", "Erro ao carregar itens", "error");
            }
        }
    };
    xmlhttp.send();
}

// ===== LISTAR VENDEDORES =====
function ListarDadosVendedor(idMarceneiro) {
    const idvendedor = document.getElementById('idvendedor');
    if (!idvendedor) return;

    let dadosidvendedor = "";
    idvendedor.innerHTML = dadosidvendedor;

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/ListarDadosVendedor?idMarceneiro=" + idMarceneiro;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                const retornoApi = JSON.parse(xmlhttp.responseText);
                retornoApi.forEach(function (dados) {
                    dadosidvendedor += `<option value="${dados.idVendedor}">${escapeHtml(dados.nome)}</option>`;
                });
                idvendedor.innerHTML = dadosidvendedor;
            } else {
                Swal.fire("Erro", "Erro ao carregar itens", "error");
            }
        }
    };
    xmlhttp.send();
}

// ===== LISTAR LOJAS =====
function ListarDadosLoja(idMarceneiro) {
    const idloja = document.getElementById('idloja');
    if (!idloja) return;

    let dadosidloja = "";
    idloja.innerHTML = dadosidloja;

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/ListarDadosLoja?idMarceneiro=" + idMarceneiro;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                const retornoApi = JSON.parse(xmlhttp.responseText);
                retornoApi.forEach(function (dados) {
                    dadosidloja += `<option value="${dados.idLoja}">${escapeHtml(dados.razaosocial)}</option>`;
                });
                idloja.innerHTML = dadosidloja;
            } else {
                Swal.fire("Erro", "Erro ao carregar itens", "error");
            }
        }
    };
    xmlhttp.send();
}

// ===== CARREGAR DADOS DO ORÇAMENTO =====
function CarregarDadosOrcamento(id) {
    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/CarregarDadosOrcamento?id=" + id;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                const retornoApi = JSON.parse(xmlhttp.responseText);
                console.log(retornoApi);

                document.getElementById('idOrcamento').value = retornoApi.id || '';
                document.getElementById('idloja').value = retornoApi.idloja || '';
                document.getElementById('idvendedor').value = retornoApi.idvendedor || '';
                document.getElementById('idcliente').value = retornoApi.idcliente || '';
                document.getElementById('arquiteto').value = retornoApi.arquiteto || '';
                document.getElementById('dataorcamento').value = retornoApi.dataorcamento ? retornoApi.dataorcamento.split('T')[0] : '';
                document.getElementById('Rt').value = retornoApi.rt || '';
                document.getElementById('Desconto').value = retornoApi.desconto || '';
                document.getElementById('statusorcamento').value = retornoApi.statusorcamento || '';

                if (tinymce.get('Textocabecalho')) tinymce.get('Textocabecalho').setContent(retornoApi.textocabecalho || '');
                if (tinymce.get('Rodapeorcamento')) tinymce.get('Rodapeorcamento').setContent(retornoApi.textorodape || '');

                document.getElementById('ValorTotalBruto').innerHTML = retornoApi.valortotalbruto || '';
                document.getElementById('ValorDesconto').innerHTML = retornoApi.valordesconto || '';
                document.getElementById('ValorTotal').innerHTML = retornoApi.valortotal || '';
            } else {
                Swal.fire("Erro", "Erro ao carregar itens", "error");
            }
        }
    };
    xmlhttp.send();
}

// ===== INICIALIZAR TINYMCE =====
function initEditors(idMarceneiro) {
    tinymce.init({
        selector: '#Textocabecalho, #Rodapeorcamento',
        height: 250,
        menubar: false,
        language: 'pt_BR',
        plugins: 'lists link image table code wordcount',
        toolbar: 'undo redo | blocks | bold italic underline forecolor | alignleft aligncenter alignright | bullist numlist | table image code removeformat',
        branding: false,
        promotion: false,
        setup: function (editor) {
            editor.on('init', function () {
                if (editor.id === 'Rodapeorcamento') {
                    CarregarValoresPadraoEditoresTexto(idMarceneiro);
                }
            });
        }
    });
}

function CarregarValoresPadraoEditoresTexto(idMarceneiro) {
    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/CarregarDadosMarceneiro?id=" + idMarceneiro;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const retornoApi = JSON.parse(xmlhttp.responseText);
            if (tinymce.get('Textocabecalho')) tinymce.get('Textocabecalho').setContent(retornoApi.textoCabecalhoPadraoOrcamentos || '');
            if (tinymce.get('Rodapeorcamento')) tinymce.get('Rodapeorcamento').setContent(retornoApi.rodapePadraoOrcamentos || '');
        }
    };
    xmlhttp.send();
}

// ===== SALVAR CLIENTE RÁPIDO =====
function gravarClienteRapido() {
    const nome = document.getElementById('modal_nome')?.value.trim() || '';
    const telefone = document.getElementById('modal_telefone')?.value.trim() || '';
    const email = document.getElementById('modal_email')?.value.trim() || '';

    if (!nome || !telefone) {
        Swal.fire("Aviso", "Nome e Telefone são obrigatórios.", "info");
        return;
    }

    const dto = {
        IdCliente: 0,
        Idmarceneiro: document.getElementById('IdMarceneiro')?.value || '',
        Nome: nome,
        Telefone: telefone,
        Email: email
    };

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/SalvarDadosCliente";

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const retornoApi = JSON.parse(xmlhttp.responseText);

            Swal.fire({ title: "Cliente cadastrado!", icon: 'success', timer: 1500, showConfirmButton: false });
            const modalElement = document.getElementById('ModalNovoCliente');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            document.getElementById('modal_nome').value = '';
            document.getElementById('modal_telefone').value = '';
            document.getElementById('modal_email').value = '';

            // Recarrega a lista de clientes e seleciona o novo
            ListarDadosCliente(document.getElementById('IdMarceneiro')?.value || '', function () {
                const idclienteField = document.getElementById('idcliente');
                if (idclienteField) {
                    idclienteField.value = String(retornoApi.idCliente);
                    idclienteField.dispatchEvent(new Event('change'));
                }
            });
        }
    };
    xmlhttp.send(JSON.stringify(dto));
}

// ===== MÁSCARA DE TELEFONE =====
function mascaraTelefone(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) input.value = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (v.length > 5) input.value = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (v.length > 2) input.value = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
}

// ===== SALVAR ORÇAMENTO =====
function handleSalvar(isFinalizar) {
    const getNum = (id) => {
        const val = document.getElementById(id)?.value;
        return val === "" ? 0 : parseFloat(val.replace(',', '.'));
    };

    const dto = {
        Id: parseInt(document.getElementById('idOrcamento')?.value) || 0,
        Idloja: parseInt(document.getElementById('idloja')?.value) || 0,
        Idvendedor: parseInt(document.getElementById('idvendedor')?.value) || 0,
        Idmarceneiro: parseInt(document.getElementById('IdMarceneiro')?.value) || 0,
        Idcliente: parseInt(document.getElementById('idcliente')?.value) || 0,
        Arquiteto: document.getElementById('arquiteto')?.value || '',
        Dataorcamento: new Date(document.getElementById('dataorcamento')?.value).toISOString(),
        Rt: getNum('Rt'),
        Desconto: getNum('Desconto'),
        Valortotal: 0,
        Statusorcamento: document.getElementById('statusorcamento')?.value || '',
        Textorodape: tinymce.get('Rodapeorcamento')?.getContent() || '',
        Textocabecalho: tinymce.get('Textocabecalho')?.getContent() || ''
    };

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/SalvarDadosOrcamento";

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onload = function () {
        if (xmlhttp.status === 200) {
            const retornoApi = JSON.parse(xmlhttp.responseText);
            if (retornoApi.sucesso) {
                if (isFinalizar) {
                    Swal.fire({ title: retornoApi.mensagem, icon: "success", timer: 2000, showConfirmButton: false })
                        .then(() => { window.location.href = '/Orcamentos/Index'; });
                } else {
                    document.getElementById('idOrcamento').value = retornoApi.id;
                    if (Swal.isVisible()) Swal.close();
                }
            } else {
                Swal.fire({ title: "Erro", text: retornoApi.mensagem, icon: "error" })
                    .then(() => { if (isFinalizar) window.location.reload(); });
            }
        } else {
            Swal.fire("Erro", "Erro na comunicação com o servidor", "error");
        }
    };
    xmlhttp.send(JSON.stringify(dto));
}

function handleIncluirAmbiente() {
    handleSalvar(false);
    window.location.href = `/Orcamentos/AmbienteOrcamento?idOrcamento=${document.getElementById('idOrcamento').value}`;
}

function handleEditarAmbiente(id) {
    handleSalvar(false);
    window.location.href = `/Orcamentos/AmbienteOrcamento?idOrcamento=${document.getElementById('idOrcamento').value}&idAmbienteOrcamento=${id}`;
}

// ===== LISTAR AMBIENTES DO ORÇAMENTO =====
function ListarDadosAmbienteOrcamento(idOrcamento) {
    const tabelaAmbientes = document.getElementById('tabelaAmbientes');
    if (!tabelaAmbientes) return;

    let dadostabelaAmbientes = "";
    tabelaAmbientes.innerHTML = dadostabelaAmbientes;

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/ListarDadosAmbienteOrcamento?idOrcamento=" + idOrcamento;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                const retornoApi = JSON.parse(xmlhttp.responseText);
                retornoApi.forEach(function (dados) {
                    dadostabelaAmbientes += `<tr>
                        <td>${escapeHtml(dados.Ambiente)}</td>
                        <td>${escapeHtml(dados.Descricao)}</td>
                        <td>${escapeHtml(dados.TotalItens)}</td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="handleEditarAmbiente(${dados.Id})"><i class="fas fa-edit botaoItemDados"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="handleExcluirAmbiente(${dados.Id})"><i class="fas fa-trash botaoItemDados"></i></button>
                        </td>
                    </tr>`;
                });
                tabelaAmbientes.innerHTML = dadostabelaAmbientes;
            } else {
                Swal.fire("Erro", "Erro ao carregar itens", "error");
            }
        }
    };
    xmlhttp.send();
}

// ===== FUNÇÃO AUXILIAR PARA ESCAPE HTML =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleExcluirAmbiente(id) {
    Swal.fire({
        title: 'Excluir Ambiente do Orcamento?',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Excluindo...',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading()
            });

            var xmlhttp = new XMLHttpRequest();
            var theUrl = "/ExcluirDadosAmbienteOrcamento?id=" + id;

            xmlhttp.open("POST", theUrl, false);
            xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4) {
                    if (xmlhttp.status === 200) {
                        var retornoApi = JSON.parse(xmlhttp.responseText);

                        if (retornoApi.sucesso === true) {
                            Swal.fire({
                                title: 'Excluído!',
                                text: retornoApi.mensagem || 'Orçamento excluído com sucesso!',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            window.location.reload();
                        } else {
                            Swal.fire('Erro', retornoApi.mensagem || 'Erro ao excluir orçamento', 'error');    
                        }
                    } else {
                        Swal.fire("Erro", "Erro ao excluir ambiente orçamento", "error");
                    }
                }
            };
            xmlhttp.send();
        }
    });
}

