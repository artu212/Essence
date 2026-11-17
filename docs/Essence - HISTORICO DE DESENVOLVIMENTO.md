# Essence — Histórico de desenvolvimento (resumo)

**Atualizado em:** 17/11/2026  
**Repositório:** https://github.com/artu212/Essence  
**Aplicação:** https://artu212.github.io/Essence/  
**Branch:** `master`

## 1. Concepção e definição do escopo

O projeto acadêmico começou com a proposta de uma plataforma de agendamentos para barbearias, inicialmente associada ao nome **CorteOn**. Durante o planejamento, a proposta foi ampliada para atender também salões de beleza e outros estabelecimentos prestadores de serviços. O nome escolhido foi **Essence**, acompanhado do slogan **More than a look**.

O objetivo central passou a ser oferecer uma experiência simples para clientes pesquisarem estabelecimentos, consultarem serviços e profissionais e agendarem horários, ao mesmo tempo em que o estabelecimento pudesse organizar a própria agenda.

Foi definida uma implementação web com **HTML, CSS e JavaScript**, sem exigência acadêmica de banco de dados ou autenticação. A persistência local foi adotada para viabilizar a demonstração dos fluxos.

## 2. Planejamento, equipe e organização

A equipe foi organizada com três integrantes:

- **Arthur Costa:** desenvolvimento principal, integração do código, repositório e coordenação.
- **Gustavo Trega:** protótipos e usabilidade.
- **Rafael Alexandre:** levantamento e organização de requisitos e documentação.

O planejamento incluiu definição de proposta, escopo, requisitos, prototipação e acompanhamento de tarefas em Kanban. A estratégia de versionamento adotada foi manter o repositório central sob responsabilidade de Arthur, com commits e integração realizados por ele.

A primeira entrega acadêmica foi dedicada à apresentação da proposta e do escopo. O desenvolvimento posterior buscou demonstrar um sistema funcional e registrar as etapas para a entrega final.

## 3. Estrutura inicial do repositório

Foi criado o repositório `artu212/Essence`, com a estrutura principal:

- `index.html` — estrutura das telas e formulários.
- `css/style.css` — identidade visual e responsividade.
- `js/scripts.js` — lógica de interação, dados e funcionalidades.
- `assets/` — recursos visuais do projeto.
- `README.md` — apresentação inicial.

A aplicação foi desenvolvida e executada localmente no IntelliJ IDEA. O uso de Git e GitHub permitiu continuar o trabalho em computadores diferentes, mediante commits, pushes e sincronização das alterações.

**Commits iniciais registrados:**

- `0d082a1` — `chore: estrutura inicial do projeto Essence`.
- `22cd1cd` — `chore: remove arquivos locais do IntelliJ do versionamento`.
- `4f76a6c` — `docs: adiciona README inicial do Essence`.

## 4. Implementação da primeira versão funcional

A aplicação passou a contar com uma página inicial de pesquisa e apresentação de estabelecimentos, fluxos de agendamento e um painel administrativo demonstrativo. Como exemplo de utilização, foi empregado o estabelecimento **027 Barbearia**, com serviços e profissionais de demonstração.

Foram desenvolvidos recursos para:

- Cadastro e edição de estabelecimentos.
- Consulta e gerenciamento de serviços e profissionais.
- Seleção de datas e horários para agendamento.
- Verificação de conflitos de disponibilidade.
- Cancelamento e gerenciamento de agendamentos.
- Configuração de horários e bloqueios de atendimento.
- Exibição de avisos e informações do estabelecimento.
- Armazenamento local de dados para manter informações após atualizar a página.

**Commit registrado:** `62baf19` — `feat: implementa versao funcional do Essence com identidade visual`.

## 5. Aprimoramento da gestão de agendamentos e persistência

Na evolução do protótipo foram realizados ajustes na interface e na gestão dos agendamentos, com atenção ao preenchimento de formulários, à manutenção de dados após recarregar a página e à experiência de uso.

**Commit registrado:** `df0563a` — `feat: aprimora gestao de agendamentos e persistencia da interface`.

Essa etapa consolidou uma base funcional para incorporar recursos adicionais sem abandonar o objetivo acadêmico principal: demonstrar a organização de agendamentos.

## 6. Ampliação do cadastro de estabelecimentos

O cadastro e a edição de estabelecimentos foram ampliados para incluir informações de funcionamento e campos opcionais de contato, como Instagram, WhatsApp e Google Maps. Também foram discutidos e implementados ajustes de duração dos serviços em intervalos de 15 minutos.

Durante a revisão, foi identificado um problema de validação: alguns campos rotulados como opcionais estavam sendo tratados como obrigatórios. A lógica dos formulários foi ajustada para respeitar a natureza opcional desses campos.

## 7. Catálogo de produtos e carrinho demonstrativo

O Essence foi ampliado com um **catálogo opcional de produtos por estabelecimento**, mantendo o sistema de agendamentos como funcionalidade principal.

Entre os recursos incluídos estão:

- Habilitar ou desabilitar a exibição do catálogo.
- Cadastrar, editar e remover produtos.
- Informar nome, descrição e preço.
- Anexar imagem opcional a partir do computador.
- Adicionar produtos ao carrinho, alterar quantidades e calcular o total.
- Manter dados demonstrativos localmente no navegador.

O catálogo foi integrado ao mesmo `index.html`, sem necessidade de uma página HTML separada. A navegação foi ajustada para ocorrer **na mesma aba**, com opção de voltar ao Essence.

O carrinho não executa pagamentos, não envia pedidos reais e não controla estoque. Esses recursos foram mantidos fora do escopo da demonstração acadêmica.

## 8. Revisões de interface, imagens e formulários

A fase mais recente de refinamento reuniu:

- Correções nos campos opcionais dos formulários.
- Ajustes para reduzir problemas de scroll duplo e zoom automático em celulares.
- Prévia da imagem já cadastrada durante a edição, com substituição opcional.
- Exibição de imagens dos produtos preservando proporções, sem cortes intencionais.
- Máscara monetária em reais nos campos de preços atualizados.
- Cadastro inicial de serviços com campos individuais para nome, preço e duração, substituindo a entrada de vários serviços em texto livre.
- Melhorias visuais e de responsividade.

Essas mudanças foram integradas ao código antes do envio da atualização mais recente. A confirmação de funcionamento em diferentes dispositivos ainda depende de testes específicos.

## 9. Versionamento e publicação da atualização recente

Em **17/11/2026**, a atualização foi registrada no Git e enviada ao GitHub a partir do computador de trabalho.

**Commit confirmado:** `c7d1d98` — `feat: aprimora catalogo, imagens, precos e cadastro de servicos`.

O terminal registrou:

- Alteração de `index.html`, `css/style.css` e `js/scripts.js`.
- `2.255` linhas adicionadas e `809` removidas no resumo do commit.
- Envio bem-sucedido para `origin/master`.
- `git status` indicando `nothing to commit, working tree clean`.

O projeto já dispõe de publicação no **GitHub Pages**, em https://artu212.github.io/Essence/. Após esse push, é necessário confirmar visualmente que a versão mais recente foi implantada e está acessível no endereço público.

## 10. Estado atual e validação pela equipe

A implementação encontra-se em fase de **testes e estabilização**. Foi planejado o compartilhamento da aplicação com Gustavo e Rafael para verificações independentes dos principais fluxos, especialmente agendamentos, administração, catálogo, carrinho e uso em dispositivos móveis.

Permanecem atividades importantes:

1. Confirmar a implantação da última versão no GitHub Pages.
2. Executar testes independentes e registrar evidências.
3. Corrigir problemas encontrados e repetir os testes correspondentes.
4. Atualizar README e documentos de acompanhamento no repositório.
5. Concluir a documentação e a apresentação acadêmica conforme as exigências do professor.
6. Sincronizar o computador de casa com segurança, preservando alterações locais anteriores ao último push.

## 11. Limitações e possibilidades futuras

A versão atual utiliza `localStorage`, sem servidor, banco de dados centralizado ou autenticação. Isso significa que dados e agendamentos não são compartilhados entre usuários ou dispositivos e que o painel não deve ser considerado seguro para operação comercial.

Como possibilidades futuras, foram discutidas integrações com WhatsApp, notificações, pagamentos, acompanhamento de clientes e evolução para uma plataforma comercial. **Essas ideias não fazem parte da implementação acadêmica confirmada** e exigiriam nova arquitetura, autenticação e armazenamento centralizado.

## 12. Observação sobre os registros

Este histórico foi consolidado a partir das etapas relatadas durante o desenvolvimento e dos commits identificados na conversa. As fases iniciais foram descritas em ordem lógica, sem atribuir datas ou identificadores de commit não confirmados. Alterações integradas ao código não equivalem, por si só, à aprovação em testes oficiais da equipe.
