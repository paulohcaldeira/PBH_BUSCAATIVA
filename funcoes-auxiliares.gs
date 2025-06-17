/**
 * ===== FUNÇÕES AUXILIARES DO SISTEMA =====
 * Arquivo contendo funções de apoio e utilitárias
 * 
 * DESCRIÇÃO:
 * Este arquivo contém todas as funções auxiliares que suportam
 * o funcionamento do sistema principal de controle de faltas.
 * 
 * CATEGORIAS DE FUNÇÕES:
 * - Verificação e validação de turmas
 * - Funções para registro manual de faltas
 * - Processamento de dados de alunos e turmas
 * - Funções de marcação de mensagens enviadas
 * - Utilitários diversos
 * 
 * INTEGRAÇÃO:
 * Estas funções são chamadas pelo arquivo principal (codigo-principal.gs)
 * e pelas interfaces HTML para executar operações específicas.
 */

// ===== 3. FUNÇÃO PARA VERIFICAR TURMA INTEGRAL (MANTIDA) =====
/**
 * Verifica se uma turma é do tipo integral baseada no nome da turma
 * 
 * LÓGICA DE VERIFICAÇÃO:
 * - Procura por palavras-chave que indicam turma integral
 * - Verifica tanto o nome da turma quanto o turno da falta
 * - Retorna true para turmas de tempo integral
 * 
 * PALAVRAS-CHAVE PARA TURMA INTEGRAL:
 * - "INTEGRAL"
 * - "TEMPO INTEGRAL"
 * 
 * @param {string} turma - Nome/código da turma
 * @param {string} turnoDaFalta - Turno específico da falta
 * @returns {boolean} true se for turma integral, false caso contrário
 */
function verificarTurmaIntegral(turma, turnoDaFalta) {
  const turmasIntegrais = ['INTEGRAL', 'TEMPO INTEGRAL'];
  const turmaUpperCase = turma.toString().toUpperCase();
  return turmasIntegrais.some(tipo => turmaUpperCase.includes(tipo));
}

// ===== 6. NOVA FUNÇÃO PARA MODAL DE REGISTRO DE FALTAS =====
/**
 * Abre interface modal para registro manual de faltas
 * 
 * FUNCIONALIDADE:
 * - Carrega interface HTML de registro de faltas
 * - Permite seleção de turma, data e alunos
 * - Interface responsiva e intuitiva
 * - Integração com planilhas do sistema
 * 
 * DEPENDÊNCIAS:
 * - Arquivo HTML 'interface-registro-faltas'
 * - Planilha "dados" para carregar alunos
 * - Planilha "registroFaltas" para salvar registros
 */
function abrirModalRegistroFaltas() {
  try {
    const htmlOutput = HtmlService.createTemplateFromFile('interface-registro-faltas').evaluate();
    htmlOutput.setWidth(800).setHeight(600);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Registro de Faltas - [Nome da Instituição]');
  } catch (error) {
    console.error("Erro ao abrir modal de registro:", error);
    SpreadsheetApp.getUi().alert("❌ Erro ao abrir modal: " + error.toString());
  }
}

// ===== 7. FUNÇÃO PARA OBTER TURMAS DISPONÍVEIS =====
/**
 * Busca e retorna lista de turmas disponíveis na planilha "dados"
 * 
 * PROCESSAMENTO:
 * - Lê coluna E (TURMA) da planilha "dados"
 * - Remove duplicatas e valores vazios
 * - Exclui turmas canceladas
 * - Retorna lista ordenada alfabeticamente
 * 
 * FILTROS APLICADOS:
 * - Remove valores vazios ou nulos
 * - Exclui turma "CANCELADO"
 * - Remove espaços em branco
 * 
 * @returns {Array} Array com nomes das turmas disponíveis
 */
function obterTurmasDisponiveis() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("dados");
    
    // Verificar se planilha existe
    if (!sheet) return [];
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    // Buscar dados da coluna E (TURMA)
    const turmasRange = sheet.getRange(2, 5, lastRow - 1, 1);
    const turmasData = turmasRange.getValues();
    
    const turmaExcluir = "CANCELADO";
    
    // Processar e filtrar turmas
    const turmasUnicas = [...new Set(turmasData.flat()
      .filter(turma => turma && turma.toString().trim() !== '' && turma !== turmaExcluir)
    )];
    
    return turmasUnicas.sort();
  } catch (error) {
    console.error("Erro ao obter turmas:", error);
    return [];
  }
}

// ===== 8. FUNÇÃO PARA OBTER ALUNOS POR TURMA =====
/**
 * Busca alunos de uma turma específica na planilha "dados"
 * 
 * ESTRUTURA DOS DADOS RETORNADOS:
 * - nome: Nome completo do aluno
 * - responsavel: Nome do responsável
 * - tel1: Telefone principal
 * - tel2: Telefone secundário
 * - email: Email de contato
 * - status: Status do aluno (ativo/inativo)
 * - ultimaLinha: Linha na planilha para referência
 * 
 * FILTROS:
 * - Apenas alunos da turma selecionada
 * - Remove duplicatas por nome
 * - Ordena alfabeticamente por nome
 * 
 * @param {string} turmaSelecionada - Nome da turma para buscar alunos
 * @returns {Array} Array com objetos dos alunos da turma
 */
function obterAlunosPorTurma(turmaSelecionada) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("dados");
    
    if (!sheet) return [];
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    // Buscar dados das colunas A até G
    const range = sheet.getRange(2, 1, lastRow - 1, 7);
    const data = range.getValues();
    
    const alunosDaTurma = [];
    const alunosVistos = new Set();
    
    // Processar cada linha de dados
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const nomeAluno = row[0]; // Coluna A (NOME)
      const turma = row[4]; // Coluna E (TURMA)
      const status = row[6]; // Coluna G (STATUS)
      
      // Filtrar alunos da turma selecionada
      if (turma === turmaSelecionada && nomeAluno && !alunosVistos.has(nomeAluno)) {
        // Opcional: filtrar por status ativo
        // if (status && status.toString().toUpperCase() === 'ATIVO') {
        
        alunosVistos.add(nomeAluno);
        alunosDaTurma.push({
          nome: nomeAluno,
          responsavel: row[1], // Coluna B (RESPONSÁVEL)
          tel1: row[2], // Coluna C (TEL1)
          tel2: row[3], // Coluna D (TEL2)
          email: row[5], // Coluna F (EMAIL)
          status: status, // Coluna G (STATUS)
          ultimaLinha: i + 2
        });
        
        // }
      }
    }
    
    return alunosDaTurma.sort((a, b) => a.nome.localeCompare(b.nome));
  } catch (error) {
    console.error("Erro ao obter alunos:", error);
    return [];
  }
}

// ===== 9. FUNÇÃO PARA REGISTRAR FALTAS SELECIONADAS (CORRIGIDA E ATUALIZADA) =====
/**
 * Registra faltas para alunos selecionados na interface de registro manual
 * 
 * FLUXO DE PROCESSAMENTO:
 * 1. Valida dados recebidos da interface
 * 2. Determina turno baseado na turma
 * 3. Verifica duplicatas antes de inserir
 * 4. Busca telefone na planilha "dados"
 * 5. Determina posição correta para inserção
 * 6. Insere registro com formatação adequada
 * 
 * LÓGICA DE INSERÇÃO:
 * - Planilha vazia: inserir na linha 2
 * - Aluno novo: inserir no final da planilha
 * - Aluno existente: inserir após sua última linha
 * 
 * ESTRUTURA DO REGISTRO (11 colunas):
 * A: Mês, B: Data, C: Nome, D: Telefone, E: Turma
 * F: Turno, G: Turno da Falta, H: Justificativa, I: Motivo
 * J: Data Cobrança, K: Link WhatsApp
 * 
 * @param {Object} dadosRegistro - Dados do formulário de registro
 * @returns {Object} Resultado da operação com estatísticas
 */
function registrarFaltasSelecionadas(dadosRegistro) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("registroFaltas");
    
    if (!sheet) {
      throw new Error("Aba 'registroFaltas' não encontrada");
    }
    
    const { turma, dataFalta, turno, alunosSelecionados } = dadosRegistro;
    let registrosAdicionados = 0;

    // DETERMINAR TURNO BASEADO NA TURMA
    let turnoFinal = turno;
    let turnoDaFalta = ''; // Coluna G: vazia por padrão
    
    if (turma !== 'FIA') {
      // Para turmas que não são FIA, definir turno baseado na turma
      turnoFinal = determinarTurnoPorTurma(turma);
      turnoDaFalta = ''; // Coluna G fica vazia para turmas não integrais
    } else {
      // Para turma FIA (integral)
      turnoFinal = 'INTEGRAL'; // Coluna E sempre será INTEGRAL
      turnoDaFalta = turno; // Coluna G recebe o turno da falta (MANHÃ, TARDE ou INTEGRAL)
    }

    
function determinarTurnoPorTurma(turma) {
  // Converte para maiúsculo para facilitar a comparação
  const turmaMaiuscula = turma.toUpperCase();
  
  // Verifica se a turma tem 3 caracteres (padrão: XXX onde X é letra)
  if (turmaMaiuscula.length === 3) {
    const letraDoMeio = turmaMaiuscula.charAt(1); // Pega a segunda letra (índice 1)
    
    if (letraDoMeio === 'M') {
      return 'MANHÃ';
    } else if (letraDoMeio === 'T') {
      return 'TARDE';
    }
  }
  
  // Fallback: se não conseguir determinar pelo padrão, retorna MANHÃ
  console.log(`Aviso: Não foi possível determinar o turno da turma '${turma}'. Usando MANHÃ como padrão.`);
  return 'MANHÃ';
}
    
    // PROCESSAR CADA ALUNO SELECIONADO
    for (const aluno of alunosSelecionados) {
      // Converter string de data para objeto Date (sem hora)
      const dataObj = new Date(dataFalta + 'T00:00:00');
      
      // VERIFICAR DUPLICATAS
      if (verificarRegistroDuplicado(sheet, aluno.nome, dataObj)) {
        console.log(`Falta já registrada para ${aluno.nome} na data ${dataFalta}`);
        continue; // Pular este aluno
      }
      
      // OBTER MÊS CORRETO BASEADO NA DATA
      const mesesNomes = [
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
      ];
      
      const mesAtual = mesesNomes[dataObj.getMonth()];
      
      // Obter telefone da aba "dados"
      const telefoneAluno = obterTelefoneAluno(aluno.nome);
      
      // PREPARAR DADOS PARA NOVA LINHA (11 colunas)
      const novoRegistro = [
        mesAtual, // Coluna A: MÊS (baseado na data selecionada)
        dataObj, // Coluna B: Data da falta (sem hora)
        aluno.nome, // Coluna C: Nome completo
        telefoneAluno || '', // Coluna D: Telefone (da aba dados)
        turma, // Coluna E: Turma
        turnoFinal, // Coluna F: Turno
        turnoDaFalta, // Coluna G: Turno da falta
        '', // Coluna H: Justificativa (vazio)
        '', // Coluna I: Motivo (vazio)
        '', // Coluna J: Data cobrança (vazio)
        '' // Coluna K: Link WhatsApp (vazio)
      ];
      
      // DETERMINAR POSIÇÃO DE INSERÇÃO
      const ultimaLinhaAluno = encontrarUltimaLinhaAluno(sheet, aluno.nome);
      const ultimaLinhaSheet = sheet.getLastRow();
      
      let linhaParaInserir;
      
      if (ultimaLinhaSheet <= 1) {
        // CENÁRIO 1A: Planilha vazia ou só com cabeçalho
        linhaParaInserir = 2;
        sheet.getRange(linhaParaInserir, 1, 1, 11).setValues([novoRegistro]);
      } else if (ultimaLinhaAluno === 0) {
        // CENÁRIO 1B: Aluno novo - adicionar no final
        linhaParaInserir = ultimaLinhaSheet + 1;
        sheet.getRange(linhaParaInserir, 1, 1, 11).setValues([novoRegistro]);
      } else {
        // CENÁRIO 2: Aluno existe - inserir após sua última linha
        linhaParaInserir = ultimaLinhaAluno + 1;
        sheet.insertRowAfter(ultimaLinhaAluno);
        sheet.getRange(linhaParaInserir, 1, 1, 11).setValues([novoRegistro]);
      }
      
      // Remover formatação em negrito
      const range = sheet.getRange(linhaParaInserir, 1, 1, 11);
      range.setFontWeight('normal');
      
      registrosAdicionados++;
    }
    
    // PREPARAR RESPOSTA COM ESTATÍSTICAS
    const totalSelecionados = alunosSelecionados.length;
    const duplicados = totalSelecionados - registrosAdicionados;
    
    let mensagem = `✅ ${registrosAdicionados} falta(s) registrada(s) com sucesso!`;
    if (duplicados > 0) {
      mensagem += `\n⚠️ ${duplicados} registro(s) não foi(ram) adicionado(s) - já existia(m) falta(s) na mesma data.`;
    }
    
    return {
      sucesso: true,
      mensagem: mensagem,
      registrosAdicionados: registrosAdicionados,
      duplicados: duplicados
    };
    
  } catch (error) {
    console.error("Erro ao registrar faltas:", error);
    return {
      sucesso: false,
      mensagem: `❌ Erro ao registrar faltas: ${error.toString()}`,
      registrosAdicionados: 0
    };
  }
}

// ===== 10. FUNÇÃO AUXILIAR PARA VERIFICAR REGISTRO DUPLICADO =====
/**
 * Verifica se já existe registro de falta para o aluno na data especificada
 * 
 * LÓGICA DE VERIFICAÇÃO:
 * - Busca registros do aluno na planilha
 * - Compara datas ignorando horários
 * - Retorna true se encontrar duplicata
 * 
 * @param {Sheet} sheet - Referência da planilha registroFaltas
 * @param {string} nomeAluno - Nome do aluno para verificar
 * @param {Date} dataFalta - Data da falta para verificar
 * @returns {boolean} true se existe duplicata, false caso contrário
 */
function verificarRegistroDuplicado(sheet, nomeAluno, dataFalta) {
  try {
    const lastRow = sheet.getLastRow();
    
    // Planilha vazia ou só cabeçalho
    if (lastRow <= 1) {
      return false;
    }
    
    // Buscar registros (colunas A, B, C)
    const range = sheet.getRange(2, 1, lastRow - 1, 3);
    const dados = range.getValues();
    
    for (let i = 0; i < dados.length; i++) {
      const nomeNaLinha = dados[i][2]; // Coluna C - Nome
      const dataNaLinha = dados[i][1]; // Coluna B - Data
      
      // Verificar se é o mesmo aluno
      if (nomeNaLinha === nomeAluno) {
        // Verificar se é a mesma data
        if (dataNaLinha instanceof Date && dataFalta instanceof Date) {
          // Comparar apenas a data (ignorando hora)
          const dataLinha = new Date(dataNaLinha.getFullYear(), dataNaLinha.getMonth(), dataNaLinha.getDate());
          const dataFaltaComparacao = new Date(dataFalta.getFullYear(), dataFalta.getMonth(), dataFalta.getDate());
          
          if (dataLinha.getTime() === dataFaltaComparacao.getTime()) {
            return true; // Duplicado encontrado
          }
        }
      }
    }
    
    return false; // Não há duplicado
  } catch (error) {
    console.error("Erro ao verificar duplicado:", error);
    return false; // Em caso de erro, permitir inserção
  }
}

// ===== 11. FUNÇÃO AUXILIAR PARA OBTER TELEFONE DO ALUNO =====
/**
 * Busca telefone do aluno na planilha "dados"
 * 
 * PROCESSO DE BUSCA:
 * - Procura nome do aluno na coluna A
 * - Retorna telefone da coluna C (TEL1)
 * - Retorna string vazia se não encontrar
 * 
 * @param {string} nomeAluno - Nome do aluno para buscar telefone
 * @returns {string} Telefone do aluno ou string vazia
 */
function obterTelefoneAluno(nomeAluno) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetDados = spreadsheet.getSheetByName("dados");
    
    if (!sheetDados) {
      console.log("Aba 'dados' não encontrada");
      return '';
    }
    
    const ultimaLinha = sheetDados.getLastRow();
    if (ultimaLinha <= 1) {
      return ''; // Não há dados
    }
    
    // Buscar nas colunas A (nomes) e C (telefones)
    const nomes = sheetDados.getRange(2, 1, ultimaLinha - 1, 1).getValues();
    const telefones = sheetDados.getRange(2, 3, ultimaLinha - 1, 1).getValues();
    
    for (let i = 0; i < nomes.length; i++) {
      if (nomes[i][0] === nomeAluno) {
        return telefones[i][0] || '';
      }
    }
    
    return ''; // Aluno não encontrado
  } catch (error) {
    console.error("Erro ao buscar telefone:", error);
    return '';
  }
}

// ===== 12. FUNÇÃO AUXILIAR PARA ENCONTRAR ÚLTIMA LINHA DO ALUNO =====
/**
 * Encontra a última linha onde o aluno aparece na planilha
 * 
 * LÓGICA DE BUSCA:
 * - Percorre planilha de baixo para cima
 * - Busca na coluna C (nome do aluno)
 * - Retorna 0 se aluno não encontrado (novo)
 * 
 * @param {Sheet} sheet - Referência da planilha
 * @param {string} nomeAluno - Nome do aluno para buscar
 * @returns {number} Número da última linha do aluno ou 0
 */
function encontrarUltimaLinhaAluno(sheet, nomeAluno) {
  const lastRow = sheet.getLastRow();
  
  // Planilha vazia ou só cabeçalho
  if (lastRow <= 1) {
    return 0;
  }
  
  const nomes = sheet.getRange(2, 3, lastRow - 1, 1).getValues(); // Coluna C
  
  let ultimaLinha = 0; // 0 = aluno não encontrado (novo)
  for (let i = nomes.length - 1; i >= 0; i--) {
    if (nomes[i][0] === nomeAluno) {
      ultimaLinha = i + 2; // +2 porque começamos da linha 2
      break;
    }
  }
  
  return ultimaLinha;
}

// ===== 13. FUNÇÃO AUXILIAR PARA OBTER ÚLTIMO REGISTRO DO ALUNO =====
/**
 * Obtém dados do último registro de um aluno específico
 * 
 * DADOS RETORNADOS:
 * - telefone: Último telefone registrado
 * - responsavel: Nome do responsável (fallback: nome do aluno)
 * 
 * @param {Sheet} sheet - Referência da planilha
 * @param {string} nomeAluno - Nome do aluno
 * @returns {Object} Objeto com telefone e responsável
 */
function obterUltimoRegistroAluno(sheet, nomeAluno) {
  const ultimaLinha = encontrarUltimaLinhaAluno(sheet, nomeAluno);
  
  // Se aluno tem registros
  if (ultimaLinha > 1) {
    const totalLinhas = sheet.getLastRow();
    // Verificar se linha existe
    if (ultimaLinha <= totalLinhas) {
      const registro = sheet.getRange(ultimaLinha, 1, 1, 11).getValues()[0];
      return {
        telefone: registro[3] || '',
        responsavel: nomeAluno
      };
    }
  }
  
  // Aluno novo ou erro na leitura
  return {
    telefone: '',
    responsavel: nomeAluno
  };
}

// ===== 14. FUNÇÕES PARA MARCAR MENSAGENS COMO ENVIADAS (ORIGINAIS) =====
/**
 * Marca uma mensagem individual como enviada
 * 
 * FUNCIONAMENTO:
 * - Atualiza coluna J (Data da cobrança) com data atual
 * - Indica que a notificação foi processada
 * - Evita reprocessamento da mesma falta
 * 
 * @param {number} linha - Número da linha na planilha
 * @returns {boolean} true se sucesso, false se erro
 */
function markMessageAsSent(linha) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("registroFaltas");
    if (!sheet) {
      console.error("Aba 'registroFaltas' não encontrada");
      return false;
    }
    
    const dataAtual = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
    sheet.getRange(linha, 10).setValue(dataAtual); // Coluna J - Data da cobrança
    
    console.log(`Mensagem da linha ${linha} marcada como enviada em ${dataAtual}`);
    return true;
  } catch (error) {
    console.error("Erro em markMessageAsSent:", error);
    return false;
  }
}

/**
 * Marca múltiplas mensagens como enviadas em lote
 * 
 * OTIMIZAÇÃO:
 * - Processa múltiplas linhas de uma vez
 * - Mais eficiente que chamadas individuais
 * - Usado pelo botão "Confirmar Todas"
 * 
 * @param {Array} linhas - Array com números das linhas
 * @returns {boolean} true se sucesso, false se erro
 */
function markAllMessagesAsSent(linhas) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("registroFaltas");
    if (!sheet) {
      console.error("Aba 'registroFaltas' não encontrada");
      return false;
    }
    
    const dataAtual = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
    
    // Marcar todas as linhas como enviadas
    linhas.forEach(linha => {
      sheet.getRange(linha, 10).setValue(dataAtual); // Coluna J - Data da cobrança
    });
    
    console.log(`${linhas.length} mensagens marcadas como enviadas em ${dataAtual}`);
    return true;
  } catch (error) {
    console.error("Erro em markAllMessagesAsSent:", error);
    return false;
  }
}

// ===== 15. FUNÇÃO PRINCIPAL PARA GERAR RELATÓRIO =====
/**
 * Função principal para gerar relatórios individuais de alunos em PDF
 * 
 * FUNCIONALIDADE:
 * - Identifica alunos com mais de 5 faltas não justificadas
 * - Permite seleção por aluno e período
 * - Gera relatório completo em formato PDF
 * - Cria documento Google Docs temporário
 * - Converte automaticamente para PDF
 * 
 * CRITÉRIOS DE ELEGIBILIDADE:
 * - Aluno deve ter pelo menos 5 faltas não justificadas
 * - Considera apenas registros sem justificativa (coluna H vazia)
 * 
 * INTERFACE:
 * - Modal para seleção de aluno
 * - Opção de período específico ou todos os meses
 * - Feedback de progresso durante geração
 */
// 15. FUNÇÃO PRINCIPAL PARA GERAR RELATÓRIO (ATUALIZADA)
function gerarRelatorioIndividualPDFOtimizado() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaRegistros = ss.getSheetByName("registroFaltas");
    const abaDados = ss.getSheetByName("dados");
    
    // Verificar se as abas existem
    if (!abaRegistros) {
      throw new Error("Aba 'registroFaltas' não encontrada!");
    }
    if (!abaDados) {
      throw new Error("Aba 'dados' não encontrada!");
    }

    // Buscar alunos elegíveis (que possuem mais de 5 faltas não justificadas)
    const registrosRange = abaRegistros.getDataRange();
    const todosRegistros = registrosRange.getValues();
    
    // Obter lista de alunos com mais de 5 faltas não justificadas
    const alunosElegiveis = new Set();
    const mesesDisponiveis = new Set();
    const contadorFaltas = {};
    
    todosRegistros.forEach((r, i) => {
      if (i === 0) return; // Pular cabeçalho
      if (r[0] && r[2]) { // Se tem mês e nome
        const nomeAluno = r[2].toString();
        const temJustificativa = r[7] && r[7].toString().trim() !== "";
        
        // Contar faltas não justificadas por aluno
        if (!contadorFaltas[nomeAluno]) {
          contadorFaltas[nomeAluno] = { total: 0, justificadas: 0 };
        }
        contadorFaltas[nomeAluno].total++;
        if (temJustificativa) {
          contadorFaltas[nomeAluno].justificadas++;
        }
        
        mesesDisponiveis.add(r[0].toString());
      }
    });

    // Filtrar alunos com mais de 5 faltas não justificadas
    Object.keys(contadorFaltas).forEach(aluno => {
      const faltasNaoJustificadas = contadorFaltas[aluno].total - contadorFaltas[aluno].justificadas;
      if (faltasNaoJustificadas >= 5) {
        alunosElegiveis.add(aluno);
      }
    });

    if (alunosElegiveis.size === 0) {
      throw new Error("Nenhum aluno elegível encontrado (com mais de 5 faltas não justificadas).");
    }

    // Converter para arrays ordenados
    const listaAlunos = Array.from(alunosElegiveis).sort();
    const listaMeses = Array.from(mesesDisponiveis).sort();

    // Criar e mostrar interface HTML
    const htmlOutput = criarInterfaceRelatorio(listaAlunos, listaMeses);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Gerar Relatório Individual');
    
  } catch (error) {
    console.error("Erro na função gerarRelatorioIndividualPDFOtimizado:", error);
    SpreadsheetApp.getUi().alert("❌ Erro: " + error.toString());
  }
}

/**
 * Cria interface HTML para seleção de parâmetros do relatório
 * 
 * @param {Array} listaAlunos - Lista de alunos elegíveis
 * @param {Array} listaMeses - Lista de meses disponíveis
 * @returns {HtmlService.HtmlOutput} Interface HTML
 */
function criarInterfaceRelatorio(listaAlunos, listaMeses) {
  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <base target="_top">
    <meta charset="UTF-8">
    <title>Gerar Relatório Individual</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.15); 
        }
        .header { 
            text-align: center; 
            margin-bottom: 25px; 
            color: #2c3e50; 
        }
        .header h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .form-group { 
            margin-bottom: 25px; 
        }
        .form-group label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: 600; 
            color: #2c3e50; 
            font-size: 14px;
        }
        .form-group select, .form-group input { 
            width: 100%; 
            padding: 12px 15px; 
            border: 2px solid #e9ecef; 
            border-radius: 8px; 
            font-size: 14px; 
            box-sizing: border-box;
            transition: all 0.3s ease;
        }
        .form-group select:focus, .form-group input:focus {
            border-color: #3498db;
            box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
            outline: none;
        }
        .radio-group { 
            margin: 15px 0; 
            display: flex;
            gap: 20px;
        }
        .radio-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .radio-item input { 
            width: auto; 
        }
        .radio-item label {
            margin-bottom: 0;
            font-weight: normal;
            cursor: pointer;
        }
        .btn { 
            padding: 12px 30px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 600; 
            margin: 8px; 
            transition: all 0.3s ease;
        }
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }
        .btn-primary { 
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); 
            color: white; 
        }
        .btn-primary:hover:not(:disabled) { 
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
        }
        .btn-secondary { 
            background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%); 
            color: white; 
        }
        .btn-secondary:hover:not(:disabled) { 
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(149, 165, 166, 0.4);
        }
        .actions { 
            text-align: center; 
            margin-top: 30px; 
        }
        .info { 
            background: linear-gradient(135deg, #e8f4f8 0%, #d1ecf1 100%); 
            padding: 20px; 
            border-radius: 10px; 
            margin-bottom: 25px; 
            font-size: 14px; 
            border-left: 4px solid #3498db;
        }
        #loadingMessage { 
            display: none; 
            text-align: center; 
            color: #3498db; 
            margin-top: 15px; 
            font-weight: 600;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📄 Gerar Relatório Individual</h2>
            <p>Sistema de Controle de Frequência - [Nome da Instituição]</p>
        </div>
        
        <div class="info">
            <strong>📋 Alunos elegíveis:</strong> ${listaAlunos.length} (com 5+ faltas não justificadas)<br>
            <strong>📅 Períodos disponíveis:</strong> ${listaMeses.length} meses
        </div>

        <form id="relatorioForm">
            <div class="form-group">
                <label for="alunoSelect">👤 Selecione o Aluno:</label>
                <select id="alunoSelect" required>
                    <option value="">-- Selecione um aluno --</option>`;

  // Adicionar opções de alunos
  listaAlunos.forEach(aluno => {
    htmlContent += `<option value="${aluno}">${aluno}</option>`;
  });

  htmlContent += `
                </select>
            </div>

            <div class="form-group">
                <label>📅 Período do Relatório:</label>
                <div class="radio-group">
                    <div class="radio-item">
                        <input type="radio" id="mesEspecifico" name="periodoTipo" value="especifico" checked>
                        <label for="mesEspecifico">Mês específico</label>
                    </div>
                    <div class="radio-item">
                        <input type="radio" id="todosPeriodos" name="periodoTipo" value="todos">
                        <label for="todosPeriodos">Todos os meses</label>
                    </div>
                </div>
            </div>

            <div class="form-group" id="mesSelectGroup">
                <label for="mesSelect">📅 Selecione o Mês:</label>
                <select id="mesSelect">
                    <option value="">-- Selecione um mês --</option>`;

  // Adicionar opções de meses
  listaMeses.forEach(mes => {
    htmlContent += `<option value="${mes}">${mes}</option>`;
  });

  htmlContent += `
                </select>
            </div>

            <div class="actions">
                <button type="button" onclick="gerarRelatorio()" class="btn btn-primary" id="btnGerar">
                    📄 Gerar Relatório PDF
                </button>
                <button type="button" onclick="google.script.host.close()" class="btn btn-secondary">
                    ❌ Cancelar
                </button>
            </div>

            <div id="loadingMessage">
                <div class="spinner"></div>
                Gerando relatório PDF, aguarde...
            </div>
        </form>
    </div>

    <script>
        // Controlar exibição do seletor de mês
        function toggleMesSelect() {
            const mesGroup = document.getElementById('mesSelectGroup');
            const mesSelect = document.getElementById('mesSelect');
            const especifico = document.getElementById('mesEspecifico');
            
            if (especifico.checked) {
                mesGroup.style.display = 'block';
                mesSelect.required = true;
            } else {
                mesGroup.style.display = 'none';
                mesSelect.required = false;
                mesSelect.value = '';
            }
        }

        // Event listeners para os radio buttons
        document.querySelectorAll('input[name="periodoTipo"]').forEach(radio => {
            radio.addEventListener('change', toggleMesSelect);
        });

        // Gerar relatório
        function gerarRelatorio() {
            const aluno = document.getElementById('alunoSelect').value;
            const periodoTipo = document.querySelector('input[name="periodoTipo"]:checked').value;
            const mes = document.getElementById('mesSelect').value;
            
            // Validações
            if (!aluno) {
                alert('Por favor, selecione um aluno.');
                return;
            }
            
            if (periodoTipo === 'especifico' && !mes) {
                alert('Por favor, selecione um mês.');
                return;
            }
            
            // Mostrar loading e desabilitar botão
            document.getElementById('loadingMessage').style.display = 'block';
            document.getElementById('btnGerar').disabled = true;
            
            // Parâmetros para o relatório
            const parametros = {
                aluno: aluno,
                periodoTipo: periodoTipo,
                mes: periodoTipo === 'especifico' ? mes : 'TODOS'
            };
            
            // Chamar função do Google Apps Script (usando o nome correto da função)
            google.script.run
                .withSuccessHandler(function(resultado) {
                    document.getElementById('loadingMessage').style.display = 'none';
                    document.getElementById('btnGerar').disabled = false;
                    
                    if (resultado.success) {
                        // Criar download direto do PDF
                        const byteCharacters = atob(resultado.pdfData);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], {type: 'application/pdf'});
                        
                        // Criar link de download
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = resultado.nomeArquivo;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        
                        alert('✅ Relatório gerado e baixado com sucesso!');
                        
                        // Fechar modal após sucesso
                        setTimeout(() => {
                            google.script.host.close();
                        }, 2000);
                    } else {
                        alert('❌ Erro ao gerar relatório: ' + resultado.error);
                    }
                })
                .withFailureHandler(function(error) {
                    document.getElementById('loadingMessage').style.display = 'none';
                    document.getElementById('btnGerar').disabled = false;
                    alert('❌ Erro no sistema: ' + error.toString());
                })
                .processarRelatorio(parametros); // Nome da função que realmente funciona
        }
        
        // Inicializar
        toggleMesSelect();
    </script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(htmlContent)
    .setWidth(650)
    .setHeight(600);
}


// FUNÇÃO PARA PROCESSAR O RELATÓRIO (CORRIGIDA)
function processarRelatorio(parametros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaRegistros = ss.getSheetByName("registroFaltas");
    const abaDados = ss.getSheetByName("dados");
    
    const nomeAluno = parametros.aluno;
    const periodoTipo = parametros.periodoTipo;
    const mesSelecionado = parametros.mes;

    // Carregar logo (opcional)
    let logoBase64 = "";
    try {
      const logoId = "1CQ1Xlt4nWFrl_FooEICkEBfmuUZUTMoS";
      const logoBlob = DriveApp.getFileById(logoId).getBlob();
      logoBase64 = Utilities.base64Encode(logoBlob.getBytes());
    } catch (e) {
      console.log("Logo não encontrado, continuando sem logo:", e);
    }

    // Buscar dados do responsável
    let responsavel = "—";
    try {
      const dadosRange = abaDados.getDataRange();
      const todosDados = dadosRange.getValues();
      const linhaDado = todosDados.find(r => r[0] && r[0].toString() === nomeAluno);
      if (linhaDado && linhaDado[1]) {
        responsavel = linhaDado[1].toString();
      }
    } catch (e) {
      console.log("Erro ao buscar responsável:", e);
    }

    // Filtrar registros do aluno
    const registrosRange = abaRegistros.getDataRange();
    const todosRegistros = registrosRange.getValues();
    
    let registros;
    if (periodoTipo === 'todos') {
      registros = todosRegistros.filter((r, i) => {
        if (i === 0) return false; // Pular cabeçalho
        return r[2] && r[2].toString() === nomeAluno;
      });
    } else {
      registros = todosRegistros.filter((r, i) => {
        if (i === 0) return false; // Pular cabeçalho
        return r[0] && r[0].toString() === mesSelecionado && 
               r[2] && r[2].toString() === nomeAluno;
      });
    }

    if (!registros || registros.length === 0) {
      const periodoTexto = periodoTipo === 'todos' ? 'todos os períodos' : `o mês "${mesSelecionado}"`;
      throw new Error(`Nenhum registro encontrado para o aluno "${nomeAluno}" em ${periodoTexto}.`);
    }

    // Obter informações básicas do primeiro registro
    const turma = registros[0][4] || "—";
    const turno = registros[0][5] || "—";
    const hoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");

    // FUNÇÃO PARA ORDENAR MESES CORRETAMENTE
    function ordenarMeses(meses) {
      const ordemMeses = {
        'JANEIRO': 1, 'FEVEREIRO': 2, 'MARÇO': 3, 'ABRIL': 4, 'MAIO': 5, 'JUNHO': 6,
        'JULHO': 7, 'AGOSTO': 8, 'SETEMBRO': 9, 'OUTUBRO': 10, 'NOVEMBRO': 11, 'DEZEMBRO': 12
      };
      
      return meses.sort((a, b) => {
        const mesA = ordemMeses[a.toUpperCase()] || 999;
        const mesB = ordemMeses[b.toUpperCase()] || 999;
        return mesA - mesB;
      });
    }

    // Determinar período do relatório com ordenação correta
    const mesesUnicos = [...new Set(registros.map(r => r[0].toString()))];
    const mesesOrdenados = ordenarMeses(mesesUnicos);
    
    const periodoRelatorio = periodoTipo === 'todos' ? 
      `${mesesOrdenados[0]} a ${mesesOrdenados[mesesOrdenados.length - 1]}/2025` : 
      `${mesSelecionado}/2025`;

    // Processar dados por mês
    const dadosPorMes = {};
    
    registros.forEach(r => {
      const mes = r[0].toString();
      
      if (!dadosPorMes[mes]) {
        dadosPorMes[mes] = {
          diasFaltas: [],
          diasJustificadas: [],
          justificativas: {},
          datasComunicacao: []
        };
      }
      
      // Processar data da falta
      if (r[1]) {
        let dataFormatada;
        try {
          if (r[1] instanceof Date) {
            dataFormatada = Utilities.formatDate(r[1], Session.getScriptTimeZone(), "dd/MM/yyyy");
          } else {
            const tempDate = new Date(r[1]);
            dataFormatada = Utilities.formatDate(tempDate, Session.getScriptTimeZone(), "dd/MM/yyyy");
          }
          dadosPorMes[mes].diasFaltas.push(dataFormatada);
          
          // Verificar se está justificada
          if (r[7] && r[7].toString().trim() !== "") {
            dadosPorMes[mes].diasJustificadas.push(dataFormatada);
            dadosPorMes[mes].justificativas[dataFormatada] = r[8] ? r[8].toString() : "Não especificado";
          }
        } catch (e) {
          console.log("Erro ao processar data da falta:", e);
        }
      }
      
      // Processar data de comunicação
      if (r[9] && r[9] instanceof Date) {
        try {
          const dataComunicacao = Utilities.formatDate(r[9], Session.getScriptTimeZone(), "dd/MM/yyyy");
          dadosPorMes[mes].datasComunicacao.push(dataComunicacao);
        } catch (e) {
          console.log("Erro ao processar data de comunicação:", e);
        }
      }
    });

    // Gerar HTML do relatório
    const logoImg = logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="logo" alt="Logo da Prefeitura">` : '';
    
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Relatório ${nomeAluno}</title>
    <style>
        @page { 
            margin: 2cm 1.5cm; 
            size: A4; 
        }
        body { 
            font-family: Arial, sans-serif; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background: #fff; 
            line-height: 1.4;
        }
        .container { 
            max-width: 100%; 
            margin: 0; 
            padding: 0; 
        }
        .header { 
            display: flex; 
            align-items: center; 
            margin-bottom: 25px; 
            page-break-inside: avoid;
        }
        .logo { 
            width: 70px; 
            margin-right: 20px; 
        }
        .title-container { 
            flex: 1; 
        }
        h1 { 
            color: #0056b3; 
            text-align: center; 
            margin: 0; 
            font-size: 22px; 
        }
        h2 { 
            color: #0056b3; 
            text-align: center; 
            margin: 5px 0 0; 
            font-size: 16px; 
        }
        .secao { 
            margin: 20px 0; 
            padding: 15px; 
            border-left: 5px solid #0056b3; 
            background: #f8f9fa; 
            page-break-inside: avoid;
        }
        .titulo-secao { 
            margin: 0 0 15px; 
            font-size: 16px; 
            color: #0056b3; 
            font-weight: bold;
        }
        .secao-detalhes {
            margin: 20px 0;
            padding: 15px;
            border-left: 5px solid #28a745;
            background: #f1f8e9;
            page-break-inside: avoid;
        }
        .secao-conclusao { 
            margin: 20px 0; 
            padding: 15px; 
            border-left: 5px solid #0056b3; 
            background: #f1f8e9; 
            page-break-inside: avoid; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
            font-size: 13px; 
        }
        th, td { 
            border: 1px solid #ccc; 
            padding: 10px 8px; 
            text-align: left; 
        }
        th { 
            background: #e9ecef; 
            color: #000; 
            font-weight: bold;
        }
        .destaque { 
            font-weight: bold; 
            color: #0056b3; 
        }
        .justificada { 
            color: #28a745; 
            font-weight: bold;
        }
        .pendente { 
            color: #dc3545; 
            font-weight: bold;
        }
        .rodape { 
            font-size: 12px; 
            text-align: right; 
            line-height: 1.3; 
            margin-top: 30px; 
            page-break-inside: avoid; 
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .mes-secao { 
            margin: 20px 0; 
            padding: 15px; 
            border: 1px solid #ddd; 
            background: #fafafa; 
            page-break-inside: avoid;
        }
        .mes-titulo { 
            font-weight: bold; 
            color: #0056b3; 
            margin-bottom: 15px; 
            font-size: 16px;
        }
        .info-basica p {
            margin: 8px 0;
            font-size: 14px;
        }
        .detalhamento {
            margin: 15px 0;
        }
        .detalhamento p {
            margin: 8px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${logoImg}
            <div class="title-container">
                <h1>[Nome da Instituição]</h1>
                <h2>Relatório ${periodoTipo === 'todos' ? 'Consolidado' : 'Mensal'} de Frequência Escolar</h2>
            </div>
        </div>
        
        <div class="secao">
            <div class="info-basica">
                <p><strong>Aluno(a):</strong> ${nomeAluno}</p>
                <p><strong>Turma/Ano:</strong> ${turma} | <strong>Turno:</strong> ${turno}</p>
                <p><strong>Período:</strong> ${periodoRelatorio}</p>
                <p><strong>Responsável:</strong> ${responsavel}</p>
            </div>
        </div>`;

    // Calcular totais gerais
    let totalGeralFaltas = 0;
    let totalGeralJustificadas = 0;
    let todasComunicacoes = [];

    // Função auxiliar para formatação
    function formatarLista(arr) {
      if (!arr || arr.length === 0) return "nenhuma data registrada";
      if (arr.length === 1) return arr[0];
      const copia = [...arr];
      const ultimo = copia.pop();
      return copia.join(", ") + " e " + ultimo;
    }

    function obterFaltasNaoJustificadas(todas, justificadas) {
      return todas.filter(d => !justificadas.includes(d));
    }

    // Processar cada mês em ordem cronológica
    ordenarMeses(Object.keys(dadosPorMes)).forEach(mes => {
      const dados = dadosPorMes[mes];
      const totalFaltas = dados.diasFaltas.length;
      const justificadas = dados.diasJustificadas.length;
      const naoJustificadas = totalFaltas - justificadas;
      const pctJustificadas = totalFaltas > 0 ? Math.round((justificadas / totalFaltas) * 100) : 0;
      const pctNao = 100 - pctJustificadas;

      totalGeralFaltas += totalFaltas;
      totalGeralJustificadas += justificadas;
      
      // Adicionar comunicações deste mês às comunicações gerais
      dados.datasComunicacao.forEach(data => {
        todasComunicacoes.push(data);
      });

      const faltasNaoJust = obterFaltasNaoJustificadas(dados.diasFaltas, dados.diasJustificadas);

      // Adicionar seção do mês (tanto para consolidado quanto mensal)
      htmlContent += `
        <div class="mes-secao">
            <div class="mes-titulo">📅 ${mes}/2025</div>
            <table>
                <tr><th>Tipo de Falta</th><th>Quantidade</th><th>%</th><th>Status</th></tr>
                <tr>
                    <td>Justificadas</td><td>${justificadas}</td><td>${pctJustificadas}%</td>
                    <td class="justificada">${justificadas > 0 ? "Regularizada" : "—"}</td>
                </tr>
                <tr>
                    <td>Não Justificadas</td><td>${naoJustificadas}</td><td>${pctNao}%</td>
                    <td class="pendente">${naoJustificadas > 0 ? "Pendente" : "—"}</td>
                </tr>
            </table>
        </div>`;

      // Sempre adicionar detalhamento das faltas
      htmlContent += `
        <div class="secao-detalhes">
            <h3 class="titulo-secao">📋 Detalhamento das Faltas - ${mes}/2025</h3>
            <div class="detalhamento">
                <p><strong>📅 Ausências registradas:</strong></p>
                <p class="destaque">${formatarLista(dados.diasFaltas)}</p>`;
      
      if (justificadas > 0) {
        htmlContent += `
                <p><strong>✅ Faltas Justificadas:</strong></p>
                <p class="justificada">${formatarLista(dados.diasJustificadas)}</p>`;
      }
      
      if (naoJustificadas > 0) {
        htmlContent += `
                <p><strong>⚠️ Faltas Não Justificadas:</strong></p>
                <p class="pendente">${formatarLista(faltasNaoJust)}</p>`;
      }

      htmlContent += `
            </div>
        </div>`;
    });

    // Resumo geral (apenas se for consolidado)
    const totalGeralNaoJustificadas = totalGeralFaltas - totalGeralJustificadas;
    const pctGeralJustificadas = totalGeralFaltas > 0 ? Math.round((totalGeralJustificadas / totalGeralFaltas) * 100) : 0;
    const pctGeralNao = 100 - pctGeralJustificadas;

    if (periodoTipo === 'todos') {
      htmlContent += `
        <div class="secao">
            <h3 class="titulo-secao">📊 Resumo Consolidado</h3>
            <table>
                <tr><th>Tipo de Falta</th><th>Quantidade</th><th>%</th><th>Status</th></tr>
                <tr>
                    <td>Justificadas</td><td>${totalGeralJustificadas}</td><td>${pctGeralJustificadas}%</td>
                    <td class="justificada">${totalGeralJustificadas > 0 ? "Regularizada" : "—"}</td>
                </tr>
                <tr>
                    <td>Não Justificadas</td><td>${totalGeralNaoJustificadas}</td><td>${pctGeralNao}%</td>
                    <td class="pendente">${totalGeralNaoJustificadas > 0 ? "Pendente" : "—"}</td>
                </tr>
            </table>
        </div>`;
    }
        
    htmlContent += `
        <div class="secao">
            <h3 class="titulo-secao">✉️ Comunicações Realizadas</h3>
            <p><strong>Tentativas de contato via WhatsApp:</strong></p>
            ${todasComunicacoes.length > 0 ? 
                `<p>${[...new Set(todasComunicacoes)].join(' • ')}</p>` : 
                `<p>Nenhuma comunicação registrada até o momento</p>`
            }
        </div>
        
        <div class="secao-conclusao">
            <h3 class="titulo-secao">📝 Considerações Finais</h3>
            <p>Este relatório apresenta a situação de frequência escolar do(a) aluno(a) <strong>${nomeAluno}</strong> no período de <strong>${periodoRelatorio}</strong>.</p>
            
            <p><strong>Situação atual:</strong></p>
            <p>• Total de ausências registradas: <strong>${totalGeralFaltas}</strong></p>
            <p>• Faltas devidamente justificadas: <strong>${totalGeralJustificadas}</strong></p>
            <p>• Faltas pendentes de justificativa: <strong>${totalGeralNaoJustificadas}</strong></p>
            
            ${totalGeralNaoJustificadas > 0 ? `
            <p><strong>⚠️ ATENÇÃO:</strong> Existem <span class="pendente">${totalGeralNaoJustificadas} falta(s) não justificada(s)</span> que necessitam regularização para manter a situação do aluno em conformidade com a legislação educacional.</p>
            
            <p><strong>Próximos passos:</strong></p>
            <p>• Prazo para justificativa: <strong>5 dias úteis</strong> a partir do recebimento deste documento</p>
            <p>• Documentos aceitos: atestados médicos, declarações, comprovantes de compromissos familiares</p>
            <p>• Entrega: presencialmente na secretaria da escola ou via formulário online</p>
            
            <p><strong>Importante:</strong> A não regularização das faltas pode impactar benefícios sociais e o acompanhamento pedagógico do aluno.</p>
            ` : `
            <p><strong>✅ SITUAÇÃO REGULAR:</strong> Todas as ausências do período estão devidamente justificadas. Parabenizamos a família pelo acompanhamento adequado da frequência escolar.</p>
            `}
            
            <div class="rodape">
                <p>Atenciosamente,</p>
                <p><strong>Coordenação Pedagógica</strong></p>
                <p><strong>[Nome da Instituição]</strong></p>
                <p>Relatório emitido em: ${hoje}</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    // Converter HTML para PDF
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'relatorio.html');
    const nomeArquivo = `Relatorio_${nomeAluno.replace(/\s+/g, '_')}_${periodoTipo === 'todos' ? 'Consolidado' : mesSelecionado}.pdf`;
    const pdfBlob = blob.getAs('application/pdf').setName(nomeArquivo);
    
    // Converter para base64 para envio direto
    const pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
    
    return {
      success: true,
      pdfData: pdfBase64,
      nomeArquivo: nomeArquivo
    };

  } catch (error) {
    console.error("Erro em processarRelatorio:", error);
    return {
      success: false,
      error: error.message || error.toString()
    };
  }
}
