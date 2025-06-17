/**
 * ===== TEMPLATES DE MENSAGENS WHATSAPP =====
 * Arquivo contendo funções para criação de mensagens personalizadas
 * 
 * DESCRIÇÃO:
 * Este arquivo contém os templates e funções para gerar mensagens
 * WhatsApp personalizadas enviadas aos responsáveis pelos alunos.
 * 
 * TIPOS DE MENSAGEM:
 * - Mensagem para turmas regulares (manhã OU tarde)
 * - Mensagem para turmas integrais (manhã E tarde)
 * 
 * CARACTERÍSTICAS DAS MENSAGENS:
 * - Tom formal mas acolhedor
 * - Informações claras sobre a falta
 * - Solicitação de justificativa
 * - Link para formulário de justificativa
 * - Orientações legais e educacionais
 * 
 * CONFORMIDADE LEGAL:
 * Todas as mensagens seguem diretrizes da Lei 9.394/96 (LDB)
 * e normas pedagógicas da instituição de ensino.
 */

// ===== 4. FUNÇÃO PARA MENSAGEM REGULAR (ORIGINAL) =====
/**
 * Cria mensagem personalizada para turmas regulares (manhã OU tarde)
 * 
 * CARACTERÍSTICAS DA MENSAGEM REGULAR:
 * - Direcionada para turmas que funcionam em um período
 * - Tom cordial e informativo
 * - Enfoque na importância da frequência escolar
 * - Link direto para formulário de justificativa
 * - Orientações sobre benefícios sociais
 * 
 * ESTRUTURA DA MENSAGEM:
 * 1. Saudação personalizada à família
 * 2. Informação sobre a falta detectada
 * 3. Solicitação cordial de justificativa
 * 4. Link do formulário oficial
 * 5. Explicação dos benefícios da justificativa
 * 6. Orientações finais e assinatura institucional
 * 
 * @param {string} nomeCompleto - Nome completo do aluno
 * @param {string} primeiroNome - Primeiro nome do aluno (para personalização)
 * @param {string} dataFalta - Data da falta formatada (dd/MM/yyyy)
 * @param {string} primeiroNomeResponsavel - Primeiro nome do responsável
 * @param {string} dataString - Data atual (parâmetro original mantido)
 * @returns {string} Mensagem formatada para WhatsApp
 */
function criarMensagemRegular(nomeCompleto, primeiroNome, dataFalta, primeiroNomeResponsavel, dataString) {
  return `Olá, Família do(a) *${nomeCompleto}* ! Tudo bem?

Notamos a ausência do(a) *${primeiroNome}* na escola no dia *${dataFalta}*. Gostaríamos de saber se está tudo bem?

Pedimos, por gentileza, que justifique a falta mencionada no formulário abaixo:

*Link do Formulário*
https://forms.gle/smbzzfNrg7C4EUQKA

*Por que justificar?*
✓ Mantém a frequência em dia;
✓ Garante direitos (como benefícios sociais);
✓ Evita novas notificações.

*Lembrete:*
* Já justificou? Pode ignorar esta mensagem.

Obrigado(a) pela atenção e parceria!
*Equipe [Nome da Instituição]*`;

}

// ===== 5. FUNÇÃO PARA MENSAGEM INTEGRAL (ORIGINAL) =====
/**
 * Cria mensagem personalizada para turmas integrais (manhã E tarde)
 * 
 * DIFERENÇAS DA MENSAGEM INTEGRAL:
 * - Especifica o período da falta (manhã/tarde/integral)
 * - Aborda características específicas do ensino integral
 * - Explica impacto diferenciado das faltas por período
 * - Informações sobre estrutura de tempo integral
 * 
 * LÓGICA DE PERÍODOS:
 * - "manhã": falta apenas no período matutino
 * - "tarde": falta apenas no período vespertino  
 * - "integral"/"ambos"/"manhã e tarde": falta nos dois períodos
 * - outros: exibe turno conforme informado
 * 
 * CARACTERÍSTICAS ESPECIAIS:
 * - Explicação sobre educação integral
 * - Orientações específicas para alunos de tempo integral
 * - Ênfase na importância de cada período
 * 
 * @param {string} nomeCompleto - Nome completo do aluno
 * @param {string} primeiroNome - Primeiro nome do aluno
 * @param {string} dataFalta - Data da falta formatada
 * @param {string} turnoDaFalta - Período específico da falta
 * @param {string} primeiroNomeResponsavel - Primeiro nome do responsável
 * @returns {string} Mensagem formatada para turmas integrais
 */
function criarMensagemIntegral(nomeCompleto, primeiroNome, dataFalta, turnoDaFalta, primeiroNomeResponsavel) {
  // PERSONALIZAÇÃO DO TEXTO BASEADA NO TURNO DA FALTA
  let textoTurno = "";
  if (turnoDaFalta) {
    const turnoLower = turnoDaFalta.toString().toLowerCase();
    if (turnoLower.includes('manhã')) {
      textoTurno = "no período da *manhã*";
    } else if (turnoLower.includes('tarde')) {
      textoTurno = "no período da *tarde*";
    } else if (turnoLower.includes('integral') || turnoLower.includes('ambos') || turnoLower.includes('manhã e tarde')) {
      textoTurno = "nos períodos da *manhã e tarde*";
    } else {
      textoTurno = `no turno *${turnoDaFalta}*`;
    }
  }

  return `Olá, Família do(a) *${nomeCompleto}* ! Tudo bem?

Notamos a ausência do(a) *${primeiroNome}* na escola no dia *${dataFalta}* ${textoTurno}. 

Pedimos, por gentileza, que justifique a falta mencionada no formulário abaixo:

*Link do Formulário*
https://forms.gle/smbzzfNrg7C4EUQKA

*Por que justificar?*
✓ Mantém a frequência em dia
✓ Garante direitos (como benefícios sociais)
✓ Evita novas notificações

*Importante para alunos integrais:*
- Faltas são registradas por período (manhã/tarde)
- Cada período conta como uma falta independente
- Justifique sempre que necessário

*Lembrete:*
- Já justificou? Pode ignorar esta mensagem.

Obrigado(a) pela atenção e parceria!
*Equipe [Nome da Instituição]*`;
}
