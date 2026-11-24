# STATUS — Essence

**Atualizado em:** 17/11/2026  
**Repositório:** https://github.com/artu212/Essence  
**Demonstração:** https://artu212.github.io/Essence/  
**Branch:** `master`  
**Último commit de código confirmado:** `b9786fe` — `fix: remove circulos decorativos do hero e ajusta layout mobile`  
**Situação:** software publicado e conferido; finalização acadêmica em andamento.

## Resumo executivo

O **Essence — More than a look** é um protótipo acadêmico de plataforma web para descoberta de estabelecimentos e agendamentos de serviços. Inclui páginas individuais, agenda, painel demonstrativo de gestão, contas fictícias e catálogo opcional com carrinho. A aplicação utiliza HTML, CSS, JavaScript e armazenamento local no navegador, sem back-end ou autenticação real.

Em 17/11/2026, o usuário confirmou que o site está funcionando após o commit `b9786fe`. O terminal mostrou `HEAD` e `origin/master` no mesmo commit, árvore de trabalho limpa e `Everything up-to-date` no push. Isso confirma a sincronização do código, **não** a aprovação de todos os testes nem a conclusão da entrega da A3.

## Andamento das entregas

| Atividade | Situação | Observação |
|---|---|---|
| Tema, proposta, escopo e identidade visual | Concluídos | Essence — *More than a look*. |
| Protótipos de telas | Concluídos | Informação confirmada pelo grupo. |
| Aplicação web e interface responsiva | Implementadas e publicadas | Site conferido após o último commit. |
| Busca e páginas individuais | Implementadas | Links compartilháveis, capa opcional, contatos, avisos e catálogo. |
| Cadastro/edição de estabelecimentos | Implementados | Dados locais ao navegador. |
| Serviços, profissionais e horários | Implementados | Serviços selecionados no fluxo de agendamento. |
| Agendamentos, bloqueios e indisponibilidades | Implementados | Regras e formulários revisados; testes completos ainda a consolidar. |
| Contas e área Minha conta | Implementadas | Contas demonstrativas, sem autenticação segura. |
| Catálogo e carrinho | Implementados | Sem pagamento ou pedido real. |
| Ajustes de responsividade móvel | Publicados | Inclui remoção dos círculos decorativos do hero. |
| Versionamento e GitHub Pages | Confirmados | `b9786fe`, `master` sincronizada, site funcionando. |
| Testes independentes de Gustavo e Rafael | Em andamento | Aguardar relatório e evidências. |
| README, STATUS e histórico | Atualização preparada | Arquivos precisam ser copiados e commitados. |
| Documento final da A3 | Pendente | Conteúdo textual inicial preparado; adequar ao template oficial. |
| Apresentação / Pitch | Pendente de confirmação | Preparar/validar material e demonstração final. |
| Envio da Sprint 2 no Ânima Hub | Não confirmado | Prazo informado: 18/11/2026. |

## Funcionalidades atuais

### Cliente

- Pesquisa de estabelecimentos e navegação por páginas individuais.
- Consulta de serviços, profissionais, horários e informações do estabelecimento.
- Agendamento, consulta, cancelamento e reagendamento demonstrativos.
- Cadastro/login fictícios e área Minha conta.
- Catálogo opcional, carrinho e pedidos demonstrativos.

### Estabelecimento

- Cadastro e edição de informações, capa, descrição e links de contato/localização.
- Administração de serviços, profissionais, preços e horários de funcionamento.
- Seleção de dias de atendimento por caixas de seleção.
- Gestão de agendamentos, folgas, feriados e períodos de indisponibilidade.
- Avisos gerais com data de início e data final opcional.
- Gestão de produtos e exibição opcional de catálogo.

### Interface e persistência

- Layout responsivo com ajustes recentes para dispositivos móveis.
- Capa omitida quando o estabelecimento não possui imagem.
- Cartão de serviços removido da página individual; seleção permanece no agendamento.
- Círculos decorativos da seção inicial removidos para evitar sobreposição em telas pequenas.
- Persistência demonstrativa via `localStorage` e sessão local, sem sincronização entre dispositivos.

## Equipe

| Integrante | Atuação |
|---|---|
| Arthur Costa | Desenvolvimento, integração, versionamento e coordenação. |
| Gustavo Trega | Protótipos, usabilidade e testes. |
| Rafael Alexandre | Requisitos, documentação e testes. |

## Pendências prioritárias para 18/11/2026

1. Obter/conferir o **template oficial** de documentação do professor.
2. Consolidar introdução, problema, justificativa, objetivos, público-alvo, escopo e requisitos já preparados.
3. Inserir protótipos prontos, casos de uso, fluxos, diagrama de classes e modelo de dados, conforme aplicável.
4. Receber e registrar os resultados dos testes da equipe; corrigir somente falhas relevantes e retestar.
5. Preparar/revisar o Pitch e a demonstração do sistema com participação da equipe.
6. Conferir formato, anexos e **envio efetivo** do Projeto Final e Pitch pelo Ânima Hub.
7. Versionar estes três documentos em um commit próprio após substituí-los no repositório.

## Riscos e limitações

- O armazenamento local não permite sincronização real entre usuários ou dispositivos.
- O cadastro/login e o painel administrativo são demonstrativos e não oferecem segurança de produção.
- O carrinho não processa pagamentos, pedidos comerciais ou estoque real.
- Testes independentes e evidências finais ainda não foram consolidados.
- A documentação precisa corresponder ao comportamento realmente implementado e ao template oficial.

## Critério de encerramento

**Software publicado:** confirmado.  
**Documentação final validada no template:** pendente.  
**Testes registrados e revisados:** pendente.  
**Pitch/apresentação final:** pendente de confirmação.  
**Entrega oficial no Ânima Hub:** não confirmada.

A A3 só deve ser marcada como concluída após a confirmação dos entregáveis exigidos pela disciplina.
