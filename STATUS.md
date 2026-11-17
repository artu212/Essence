# STATUS — Essence

**Atualizado em:** 17/11/2026  
**Repositório:** https://github.com/artu212/Essence  
**Demonstração:** https://artu212.github.io/Essence/  
**Branch:** `master`  
**Último commit confirmado:** `10166a3` — atualização de contas demonstrativas e experiência do cliente.
**Nova versão:** páginas individuais de estabelecimentos e ajustes de avisos/contatos; aguardando commit e push.

## Resumo executivo

O **Essence** está implementado como protótipo web demonstrativo, com recursos de agendamento, gestão de estabelecimentos, serviços e profissionais, além de catálogo opcional de produtos e carrinho. O código da atualização anterior foi enviado ao GitHub com sucesso no commit `10166a3`. A atualização das páginas individuais está preparada localmente, mas ainda não foi enviada. A etapa atual é **validação pela equipe, correção de eventuais falhas e conclusão dos materiais acadêmicos**.

> O envio do código ao GitHub não comprova, por si só, que todos os fluxos passaram por testes independentes ou que a versão mais recente já foi verificada no GitHub Pages.

## Andamento das entregas

| Atividade | Situação | Observação |
|---|---|---|
| Definição de tema, proposta e escopo | Concluída | Plataforma de agendamentos para diferentes tipos de estabelecimento. |
| Nome, slogan e identidade visual | Definidos | Essence — *More than a look*. |
| Estrutura HTML, CSS e JavaScript | Implementada | Aplicação estática, sem back-end. |
| Busca e páginas individuais de estabelecimentos | Implementadas localmente | Link compartilhável, capa, contatos, serviços e produtos; validar e publicar. |
| Cadastro e edição de estabelecimentos | Implementados | Dados persistidos no navegador. |
| Serviços, profissionais e horários | Implementados | Inclui melhorias nos campos de cadastro e preços. |
| Agendamentos e gestão de disponibilidade | Implementados | Inclui bloqueios, gerenciamento e avisos. |
| Catálogo opcional e carrinho | Implementados | Carrinho demonstrativo, sem pagamento ou pedido real. |
| Imagens de produtos e estabelecimentos | Atualizadas | Anexo opcional, prévia na edição e ajustes de exibição. |
| Interface móvel | Ajustada; validação pendente | Foram trabalhados scroll, zoom e responsividade; testar em dispositivos reais. |
| Persistência via `localStorage` | Implementada | Dados locais, sem sincronização entre usuários. |
| Commit e push da atualização anterior | Concluídos | `10166a3` enviado para `origin/master`. |
| Commit e push das páginas individuais | **Pendentes** | Conferir arquivos, testar, versionar e enviar. |
| Contas e login demonstrativos | Implementados | Múltiplos perfis locais; sem autenticação real. |
| Avisos gerais e indisponibilidades | Ajustados localmente | Gerais apenas na página; indisponibilidades também na agenda. |
| Verificação da versão mais recente no GitHub Pages | A confirmar | Abrir a URL e conferir as alterações publicadas. |
| Testes independentes da equipe | **Pendentes** | Gustavo e Rafael devem testar e registrar resultados. |
| Evidências e registro de bugs | **Pendentes** | Anotar cenários, resultados e correções. |
| README e documentos de acompanhamento | Preparados para inclusão | Esta revisão documental ainda precisa ser commitada. |
| Relatório e demais entregáveis acadêmicos | A confirmar | Conferir requisitos finais da disciplina. |
| Apresentação final | **Pendente** | Preparar demonstração e divisão de falas. |

## Funcionalidades disponíveis

### Agendamentos

- Pesquisa e consulta de estabelecimentos.
- Seleção de serviços, profissionais e horários.
- Contas demonstrativas com múltiplos perfis e área Minha conta.
- Gestão demonstrativa de agendamentos, bloqueios e avisos.

### Administração demonstrativa

- Cadastro e edição de estabelecimentos.
- Gestão de profissionais, serviços, duração e preços.
- Configuração de dias e horários de atendimento.
- Links opcionais de contato e localização na página individual do estabelecimento.
- Foto de capa, descrição e endereço compartilhável por estabelecimento.

### Produtos

- Catálogo opcional por estabelecimento.
- Cadastro, edição e exclusão de produtos.
- Imagem opcional e prévia durante edição.
- Carrinho com quantidades e totalização.
- Navegação entre catálogo e página principal na mesma aba.

## Equipe e responsabilidades

| Integrante | Responsabilidade no projeto | Foco recomendado nesta etapa |
|---|---|---|
| Arthur Costa | Desenvolvimento, integração, Git e coordenação | Corrigir bugs, consolidar documentação e coordenar apresentação. |
| Gustavo Trega | Protótipos e usabilidade | Testar fluxos, responsividade e carrinho. |
| Rafael Alexandre | Requisitos e documentação | Conferir requisitos, registrar testes e apoiar documentação. |

As responsabilidades representam a organização informada do projeto; testes e documentos só devem ser marcados como concluídos quando houver entrega efetiva.

## Riscos e limitações

1. **Armazenamento local:** não há sincronização de dados entre navegadores ou usuários.
2. **Sem autenticação:** o painel não é seguro para operação comercial real.
3. **Sem pagamentos ou pedidos reais:** catálogo e carrinho são demonstrativos.
4. **Compatibilidade móvel:** é necessária validação em navegadores e telas reais.
5. **Prazo acadêmico:** priorizar estabilidade e evidências, evitando novas funcionalidades nesta etapa.

## Próximos passos

1. Testar localmente a página individual, links compartilháveis, contatos e avisos em PC e celular.
2. Realizar commit e push do código e dos documentos atualizados.
3. Confirmar a atualização publicada no GitHub Pages.
4. Compartilhar a URL com Gustavo e Rafael para testes independentes.
5. Registrar cada cenário de teste, resultado esperado, resultado observado, dispositivo e evidência.
6. Corrigir falhas encontradas e repetir os testes afetados.
7. Conferir a versão final de `README.md`, `STATUS.md` e do histórico de desenvolvimento.
8. Finalizar os materiais exigidos pela disciplina e ensaiar a demonstração.
9. Sincronizar o PC de casa com cuidado, preservando alterações locais antes de atualizar a branch.

## Critério de conclusão

A implementação está publicada no repositório, mas **a entrega acadêmica não deve ser considerada encerrada** até a validação da equipe, o registro dos resultados e a finalização dos materiais exigidos pelo professor.
