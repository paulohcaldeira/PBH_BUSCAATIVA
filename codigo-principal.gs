/**
 * ===== CÓDIGO GOOGLE APPS SCRIPT MELHORADO =====
 * Arquivo principal contendo as funções centrais do sistema
 * 
 * DESCRIÇÃO DO SISTEMA:
 * Sistema de controle de faltas escolares da [Nome Instituição]
 * Gera notificações automáticas via WhatsApp para responsáveis
 * Integra com planilhas Google Sheets para controle completo
 * 
 * FUNCIONALIDADES PRINCIPAIS:
 * - Processamento de faltas não justificadas
 * - Geração de links WhatsApp personalizados
 * - Interface web para envio de notificações
 * - Registro manual de faltas por turma
 * - Geração de relatórios individuais em PDF
 * 
 * DEPENDÊNCIAS:
 * - Planilha "registroFaltas" (dados das faltas)
 * - Planilha "dados" (informações dos alunos e responsáveis)
 * - Arquivos HTML para interfaces (separados)
 * 
 * DESENVOLVIDO POR: Paulo Caldeira - Assistente Administrativo Educacional
 * CONTATO: paulo.caldeira@edu.pbh.gov.br | (31) 93618-5049
 */

// ===== 0. FUNÇÃO PARA CRIAR MENU PERSONALIZADO =====
/**
 * Cria menu personalizado na planilha Google Sheets
 * Esta função é executada automaticamente quando a planilha é aberta
 * 
 * MENU CRIADO:
 * - "[Nome da Instituição]" (menu principal)
 *   - "📱 Gerar Notificações WhatsApp" 
 *   - "📝 Registrar Faltas Manualmente"
 *   - "---" (separador)
 *   - "❓ Sobre o Sistema"
 * 
 * IMPORTANTE: Esta função deve estar no arquivo principal
 * para ser reconhecida pelo Google Sheets
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Criar menu principal
    ui.createMenu('🏫 Sistema de Frequência Escolar')
      .addItem('📱 Notificar responsáveis', 'enviarMensagensWhatsAppOtimizado')
      .addItem('➕ Registrar Faltas', 'abrirModalRegistroFaltas')
      .addItem('📊 Gerar Relatório', 'gerarRelatorioIndividualPDFOtimizado')
      .addSeparator()
      .addItem('❓ Sobre o Sistema', 'mostrarInformacoesSistema')
      .addToUi();
      
    console.log('Menu personalizado criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar menu:', error);
  }
}

/**
 * Exibe informações sobre o sistema
 * Função chamada pelo item "Sobre o Sistema" do menu
 */
function mostrarInformacoesSistema() {
  const ui = SpreadsheetApp.getUi();
  
  const titulo = '🏫 Sistema de Controle de Faltas - [Nome da Instituição]';
  const mensagem = `
SISTEMA DE CONTROLE DE FREQUÊNCIA ESCOLAR

📋 FUNCIONALIDADES:
• Processamento automático de faltas não justificadas
• Geração de notificações personalizadas via WhatsApp
• Registro manual de faltas por turma
• Interface web moderna e responsiva
• Controle completo de envios e confirmações

⚖️ CONFORMIDADE LEGAL:
Este sistema opera conforme Lei 9.394/96 (LDB) e normas educacionais brasileiras.

👨‍💼 DESENVOLVEDOR:
[Nome Desenvolvedor]
Lotação: [Nome da Instituição]
📧 [Email]
📞 [Telefone]

📅 VERSÃO: v2.0 
🔧 TECNOLOGIA: Google Apps Script + HTML/CSS/JavaScript

Para usar o sistema:
1. Use "📱 Notificar responsáveis" para enviar mensagem no Whatsapp
2. Use "➕ Registrar Faltas" para adicionar faltas
3. Use "📊 Gerar Relatório" para criar um relatório mensal ou consolidado de um aluno
4. Mantenha as abas "dados" e "registroFaltas" organizadas

IMPORTANTE: Mantenha backups regulares dos dados!
  `;
  
  ui.alert(titulo, mensagem, ui.ButtonSet.OK);
}

// ===== 1. FUNÇÃO PRINCIPAL PARA WHATSAPP (CORRIGIDA) =====
/**
 * Função principal que processa faltas não justificadas e gera notificações WhatsApp
 * 
 * FLUXO DE EXECUÇÃO:
 * 1. Valida planilhas necessárias ("registroFaltas" e "dados")
 * 2. Carrega dados das faltas e responsáveis
 * 3. Filtra registros que precisam de notificação
 * 4. Gera mensagens personalizadas (regular ou integral)
 * 5. Cria links WhatsApp formatados
 * 6. Salva links na planilha
 * 7. Exibe interface HTML para envio
 * 
 * CRITÉRIOS PARA PROCESSAMENTO:
 * - Falta NÃO possui justificativa (coluna H vazia)
 * - Falta NÃO possui data de cobrança (coluna J vazia)
 * - Falta NÃO possui link WhatsApp (coluna K vazia)
 * - Registro possui dados obrigatórios (nome, telefone, data)
 */
function enviarMensagensWhatsAppOtimizado() {
  try {
    // Obter referências das planilhas necessárias
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("registroFaltas");
    const dadosSheet = spreadsheet.getSheetByName("dados");
    
    // Validar se planilha principal existe
    if (!sheet) {
      SpreadsheetApp.getUi().alert("❌ Erro: A aba 'registroFaltas' não foi encontrada!");
      return;
    }

    // Verificar se há dados para processar
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      SpreadsheetApp.getUi().alert("ℹ️ Não há dados para processar.");
      return;
    }

    // Buscar dados da aba registroFaltas (colunas A até K)
    // ESTRUTURA DAS COLUNAS:
    // A: Mês, B: Data da Falta, C: Nome Completo, D: Telefone
    // E: Turma, F: Turno, G: Turno da Falta, H: Justificativa
    // I: Motivo, J: Data Cobrança, K: Link WhatsApp
    const range = sheet.getRange(2, 1, lastRow - 1, 11);
    const data = range.getValues();
    
    // Buscar dados dos responsáveis da aba "dados" (coluna B)
    // Criar mapeamento: nome_aluno -> nome_responsavel
    let dadosResponsaveis = {};
    if (dadosSheet) {
      const dadosRange = dadosSheet.getDataRange();
      const dadosValues = dadosRange.getValues();
      for (let i = 1; i < dadosValues.length; i++) {
        const nomeAluno = dadosValues[i][0]; // Coluna A - nome do aluno
        const responsavel = dadosValues[i][1]; // Coluna B - responsável
        if (nomeAluno && responsavel) {
          dadosResponsaveis[nomeAluno] = responsavel;
        }
      }
    }
    
    // Variáveis de controle do processamento
    let linksParaEnviar = []; // Array para interface HTML
    let linksGerados = 0;     // Contador de novos links

    // PROCESSAMENTO LINHA POR LINHA
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Extrair dados de cada coluna
      const nomeCompleto = row[2]; // Coluna C
      let telefone = row[3]; // Coluna D
      const dataFaltaOriginal = row[1]; // Coluna B
      const turma = row[4]; // Coluna E
      const turno = row[5]; // Coluna F
      const turnoDaFalta = row[6]; // Coluna G
      const justificativa = row[7]; // Coluna H
      const motivo = row[8]; // Coluna I
      const dataCobranca = row[9]; // Coluna J
      const linkExistente = row[10]; // Coluna K
      const dataHoje = new Date();
      const dataString = dataHoje.toLocaleDateString('pt-BR')
     
      // FILTROS DE PROCESSAMENTO:
      // Pular registros que não precisam de processamento
      if (linkExistente || dataCobranca || justificativa || 
          !nomeCompleto || !telefone || !dataFaltaOriginal) {
        continue;
      }

      // Extrair primeiro nome para personalização da mensagem
      const primeiroNome = nomeCompleto.toString().split(" ")[0];
      
      // Buscar responsável na aba dados (usar nome do aluno como fallback)
      const responsavel = dadosResponsaveis[nomeCompleto] || nomeCompleto;
      const primeiroNomeResponsavel = responsavel.toString().split(" ")[0];
      
      // FORMATAÇÃO DA DATA DA FALTA
      let dataFalta;
      try {
        if (dataFaltaOriginal instanceof Date) {
          dataFalta = Utilities.formatDate(dataFaltaOriginal, Session.getScriptTimeZone(), "dd/MM/yyyy");
        } else {
          const tempDate = new Date(dataFaltaOriginal);
          dataFalta = Utilities.formatDate(tempDate, Session.getScriptTimeZone(), "dd/MM/yyyy");
        }
      } catch (e) {
        console.log(`Erro ao formatar data na linha ${i + 2}: ${e}`);
        continue; // Pular esta linha se não conseguir formatar a data
      }

      // FORMATAÇÃO DO TELEFONE PARA WHATSAPP
      // Remover caracteres não numéricos
      telefone = telefone.toString().replace(/\D/g, "");
      // Adicionar código de área se necessário (31 para BH)
      if (telefone.length <= 8) {
        telefone = "31" + telefone;
      }
      // Adicionar código do país (+55 Brasil)
      if (!telefone.startsWith("55")) {
        telefone = "55" + telefone;
      }

    function verificarTurmaIntegral(turma, turnoDaFalta) {
      const turmaLower = turma.toString().toLowerCase();
      const turnoLower = turnoDaFalta.toString().toLowerCase();

      const ehIntegralPorNome = turmaLower.includes('integral') || turmaLower.includes('int');
      const ehIntegralPorTurno = turnoLower.includes('integral') || turnoLower.includes('ambos') || turnoLower.includes('manhã e tarde');

      return ehIntegralPorNome || ehIntegralPorTurno;
    }

      // GERAÇÃO DA MENSAGEM PERSONALIZADA
      // Verificar tipo de turma e criar mensagem apropriada
      const ehTurmaIntegral = turno && turno.toString().toLowerCase() === "integral";
      const mensagem = ehTurmaIntegral ?
        criarMensagemIntegral(nomeCompleto, primeiroNome, dataFalta, turnoDaFalta, primeiroNomeResponsavel) :
        criarMensagemRegular(nomeCompleto, primeiroNome, dataFalta, primeiroNomeResponsavel);

      // CRIAÇÃO DO LINK WHATSAPP
      const mensagemCodificada = encodeURIComponent(mensagem);
      const linkWhatsApp = `https://wa.me/${telefone}?text=${mensagemCodificada}`;

      // SALVAMENTO NA PLANILHA
      // Salvar link gerado na coluna K
      sheet.getRange(i + 2, 11).setValue(linkWhatsApp);
      linksGerados++;
      
      // PREPARAÇÃO DOS DADOS PARA INTERFACE
      // Adicionar informações para a interface HTML
      linksParaEnviar.push({
        linha: i + 2,
        nome: nomeCompleto,
        responsavel: primeiroNomeResponsavel,
        telefone: telefone,
        data: dataFalta,
        turma: turma,
        turno: turno,
        turnoDaFalta: turnoDaFalta,
        tipoMensagem: ehTurmaIntegral ? 'Integral' : 'Regular',
        link: linkWhatsApp
      });
    }

    // VALIDAÇÃO FINAL E FEEDBACK
    if (linksParaEnviar.length === 0) {
      SpreadsheetApp.getUi().alert("ℹ️ Não existem faltas sem justificativa para notificar.");
      return;
    }
    
    // Informar quantos novos links foram gerados
    if (linksGerados > 0) {
      SpreadsheetApp.getUi().alert(`✅ ${linksGerados} novos links gerados.`);
    }

    // CRIAÇÃO E EXIBIÇÃO DA INTERFACE
    // Criar interface HTML personalizada e exibir ao usuário
    const htmlOutput = criarInterfaceHTML(linksParaEnviar);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Enviar Mensagens WhatsApp');
    
  } catch (error) {
    // TRATAMENTO DE ERROS GLOBAIS
    console.error("Erro na função enviarMensagensWhatsAppOtimizado:", error);
    SpreadsheetApp.getUi().alert("❌ Erro: " + error.toString());
  }
}


// ===== 2. FUNÇÃO PARA CRIAR INTERFACE HTML (ORIGINAL) =====
/**
 * Gera interface HTML completa para visualização e envio das notificações WhatsApp
 * 
 * CARACTERÍSTICAS DA INTERFACE:
 * - Design responsivo e profissional
 * - Estatísticas das notificações geradas
 * - Lista detalhada de cada notificação
 * - Botões para envio individual e em massa
 * - Informações legais e de protocolo
 * - JavaScript integrado para funcionalidades
 * 
 * @param {Array} linksParaEnviar - Array com objetos das notificações
 * @returns {HtmlService.HtmlOutput} Interface HTML pronta para exibição
 */
function criarInterfaceHTML(linksParaEnviar) {
  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <base target="_top">
    <meta charset="UTF-8">
    <title>Sistema de Notificações - [Nome da Instituição]</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.2); 
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 25px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header .subtitle {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .stats { 
            background: #f8f9fa;
            padding: 20px; 
            border-left: 4px solid #3498db;
            margin: 20px;
            border-radius: 8px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .stat-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
        }
        .stat-label {
            font-size: 12px;
            color: #6c757d;
            margin-top: 5px;
        }
        .message-item { 
            border: 1px solid #e9ecef; 
            margin: 15px 20px; 
            border-radius: 12px; 
            background: white;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .message-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        .message-header {
            background: #f8f9fa;
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
        }
        .student-info { 
            font-weight: 600; 
            color: #2c3e50; 
            font-size: 16px;
            margin-bottom: 8px;
        }
        .details { 
            font-size: 13px; 
            color: #6c757d; 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
        }
        .detail-item {
            display: flex;
            align-items: center;
        }
        .detail-item .icon {
            margin-right: 6px;
            font-size: 12px;
        }
        .message-body {
            padding: 15px;
        }
        .actions { 
            display: flex; 
            gap: 12px; 
            align-items: center;
            flex-wrap: wrap;
        }
        .btn { 
            padding: 10px 20px; 
            border: none; 
            border-radius: 6px; 
            cursor: pointer; 
            text-decoration: none; 
            font-size: 13px; 
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .btn-whatsapp { 
            background: #25D366; 
            color: white; 
        }
        .btn-whatsapp:hover { 
            background: #128C7E; 
            transform: translateY(-1px);
        }
        .btn-mark { 
            background: #3498db; 
            color: white; 
        }
        .btn-mark:hover { 
            background: #2980b9; 
            transform: translateY(-1px);
        }
        .btn-all { 
            background: #e74c3c; 
            color: white; 
            padding: 15px 30px; 
            font-size: 16px; 
            margin: 25px auto; 
            display: block; 
            border-radius: 8px;
        }
        .btn-all:hover { 
            background: #c0392b; 
            transform: translateY(-2px);
        }
        .status { 
            font-size: 12px; 
            color: #27ae60; 
            margin-left: 10px;
            padding: 4px 8px;
            background: #d4edda;
            border-radius: 4px;
        }
        .notification-type { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 11px; 
            font-weight: 600; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .type-primeira { 
            background: #fff3cd; 
            color: #856404; 
            border: 1px solid #ffeaa7;
        }
        .type-critica { 
            background: #f8d7da; 
            color: #721c24; 
            border: 1px solid #f5c6cb;
        }
        .type-padrao { 
            background: #d1ecf1; 
            color: #0c5460; 
            border: 1px solid #bee5eb;
        }
        .type-integral { 
            background: #e2e3e5; 
            color: #383d41; 
            border: 1px solid #d6d8db;
        }
        .protocol-info {
            background: #e8f4f8;
            padding: 12px;
            border-radius: 6px;
            font-size: 12px;
            color: #2c3e50;
            margin-top: 10px;
        }
        .footer {
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        .legal-info {
            background: #f8f9fa;
            padding: 15px;
            margin: 20px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            font-size: 13px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ Sistema de Notificações - Cobrança de Justificativas</h1>
            <div class="subtitle">[Nome da Instituição] - Controle de Frequência Escolar</div>
            <div class="subtitle">Protocolo de Comunicação Official conforme Lei 9.394/96</div>
        </div>
        
        <div class="stats">
            <h3>📊 Resumo das Notificações</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${linksParaEnviar.length}</div>
                    <div class="stat-label">Notificações Geradas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${linksParaEnviar.filter(n => n.tipoMensagem === 'Integral').length}</div>
                    <div class="stat-label">Turma Integral</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${new Date().toLocaleDateString('pt-BR')}</div>
                    <div class="stat-label">Data de Emissão</div>
                </div>
            </div>
        </div>

        <div class="legal-info">
            <strong>⚖️ Fundamentação Legal:</strong> Este sistema opera em conformidade com a Lei Federal 9.394/96 (LDB), 
            Estatuto da Criança e do Adolescente, e Regimento Interno institucional. 
            Todas as comunicações possuem validade legal e devem ser respondidas no prazo estabelecido.
        </div>

        <div id="messages">`;

  // ADICIONAR CADA MENSAGEM NA INTERFACE
  linksParaEnviar.forEach((item, index) => {
    htmlContent += `
            <div class="message-item" id="msg-${item.linha}">
                <div class="message-header">
                    <div class="student-info">
                        👤 ${item.nome} | Responsável: ${item.responsavel}
                        <span class="notification-type type-${item.tipoMensagem === 'Integral' ? 'integral' : 'padrao'}">${item.tipoMensagem}</span>
                    </div>
                    <div class="details">
                        <div class="detail-item">
                            <span class="icon">📞</span>
                            <span>${item.telefone}</span>
                        </div>
                        <div class="detail-item">
                            <span class="icon">📅</span>
                            <span>${item.data}</span>
                        </div>
                        <div class="detail-item">
                            <span class="icon">🎓</span>
                            <span>${item.turma} - ${item.turno}</span>
                        </div>
                        ${item.turnoDaFalta ? `
                        <div class="detail-item">
                            <span class="icon">🕐</span>
                            <span>${item.turnoDaFalta}</span>
                        </div>` : ''}
                    </div>
                </div>
                <div class="message-body">
                    <div class="actions">
                        <a href="${item.link}" target="_blank" class="btn btn-whatsapp">
                            📱 Enviar via WhatsApp
                        </a>
                        <button onclick="marcarComoEnviado(${item.linha})" class="btn btn-mark">
                            ✅ Confirmar Envio
                        </button>
                        <span id="status-${item.linha}" class="status" style="display: none;"></span>
                    </div>
                    <div class="protocol-info">
                        <strong>📋 Protocolo:</strong> sigla-${item.linha}-${new Date().getFullYear()} | 
                        <strong>⏰ Validade:</strong> 30 dias | 
                        <strong>📄 Status:</strong> Aguardando envio
                    </div>
                </div>
            </div>`;
  });

  htmlContent += `
        </div>
        
        <button onclick="marcarTodosComoEnviados()" class="btn btn-all">
            ✅ Confirmar Envio de Todas as Notificações
        </button>

        <div class="footer">
            <div>🏫  [Nome da Instituição] - Sistema de Controle de Frequência</div>
            <div>👤 Desenvolvido por [Nome Desenvolvedor]</div>
            <div>📧 [Email] | 📞 [Telefone]</div>
            <div style="margin-top: 10px; font-size: 11px; opacity: 0.8;">
                Sistema desenvolvido em conformidade com a legislação educacional brasileira
            </div>
        </div>
    </div>

    <script>
        // FUNÇÕES JAVASCRIPT PARA INTERATIVIDADE DA INTERFACE
        
        /**
         * Marca uma mensagem individual como enviada
         * Atualiza a planilha com data de cobrança
         */
        function marcarComoEnviado(linha) {
            google.script.run
                .withSuccessHandler(function(success) {
                    if (success) {
                        const statusElement = document.getElementById('status-' + linha);
                        statusElement.innerHTML = '✅ Notificação Enviada';
                        statusElement.style.display = 'inline-block';
                        
                        // Desabilitar botão
                        const button = event.target;
                        button.disabled = true;
                        button.innerHTML = '✅ Enviado';
                        button.style.background = '#27ae60';
                    } else {
                        alert('Erro ao confirmar envio da notificação');
                    }
                })
                .withFailureHandler(function(error) {
                    alert('Erro no sistema: ' + error.toString());
                })
                .markMessageAsSent(linha);
        }

        /**
         * Marca todas as mensagens como enviadas
         * Processa em lote para otimizar performance
         */
        function marcarTodosComoEnviados() {
            const linhas = [${linksParaEnviar.map(item => item.linha).join(', ')}];
            
            if (confirm('Confirmar o envio de TODAS as notificações institucionais?\\n\\nEsta ação registrará o envio de ' + linhas.length + ' comunicados oficiais.')) {
                google.script.run
                    .withSuccessHandler(function(success) {
                        if (success) {
                            linhas.forEach(linha => {
                                const statusElement = document.getElementById('status-' + linha);
                                statusElement.innerHTML = '✅ Notificação Enviada';
                                statusElement.style.display = 'inline-block';
                            });
                            alert('✅ Todas as notificações foram confirmadas como enviadas!\\n\\nOs registros foram atualizados no sistema institucional.');
                        } else {
                            alert('Erro ao confirmar envios das notificações');
                        }
                    })
                    .withFailureHandler(function(error) {
                        alert('Erro no sistema: ' + error.toString());
                    })
                    .markAllMessagesAsSent(linhas);
            }
        }
    </script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(htmlContent)
    .setWidth(950)
    .setHeight(700);
}
