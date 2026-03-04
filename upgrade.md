

---

# PRD: Refatoração e Melhorias - Sistema de Monitoramento de Voluntários (V2)

## 🎯 Contexto Geral

Este documento detalha as atualizações para o sistema de gestão de voluntariado. O foco é melhorar a experiência do usuário (UX), refinar filtros administrativos e garantir a integridade dos dados de inscrição.

---

## 🗄️ 1. Alterações em Banco de Dados (Database)

* [x] **Nova Coluna:** Adicionar campo `whatsapp` na tabela de `usuarios/colaboradores`. Garantir que o campo esteja vinculado ao ID do usuário.
* [x] **Migração de Dados:** Criar script para renomear o setor `"Supervisão Administrativa"` para `"Administração"` em todas as tabelas relacionadas (Setores, Inscrições, Usuários).
* [x] **Estado de Calendário:** Adicionar atributo `status` (ativo/inativo) para datas no calendário de ações para permitir o bloqueio de dias específicos.

---

## ⚙️ 2. Lógica de Negócio & Back-end

* [x] **Validação de Vagas:** No formulário de "Nova Ação", implementar lógica que impede que a soma das "vagas específicas por setor" ultrapasse o valor definido no campo "limite de vagas".
* [x] **Formatação de Datas:** Em todos os retornos de datas de ações, incluir o **dia da semana** (ex: "Segunda-feira, 10/05").
* [x] **Lógica de Filtros Admin:**
* Implementar filtro para ações `Realizadas` (data < hoje) e `Não realizadas` (data >= hoje).
* Implementar filtro por `Mês/Ano` na lista de inscritos.


* [x] **Tratamento de Inscritos Externos:** Na listagem, se o voluntário for "Externo", separar a "Unidade" (que hoje vem no nome) e exibi-la na coluna de "Setor".

---

## 🎨 3. Front-end & Interface (UI)

* [x] **Modal de Inscrição (Refatoração):**
* Implementar fluxo em dois passos (Stepper):
1. Pergunta: "Você é colaborador da Sede ou Externo (Filial)?"
2. Renderiza os campos de inscrição específicos conforme a escolha.



* [x] **Renomeação de Labels:**
* Painel Dashboard: "Engajamento comunitário" ➔ **"Engajamento comunidade IADVH"**.
* Painel Dashboard: "Ranking de voluntariado" ➔ **"Ranking de Compromisso Social"**.
* Nova Ação: "Título" ➔ **"Nome do projeto"**.


* [x] **Reorganização de Layout:**
* No Dashboard, trocar a posição física dos modais/cards de "Comparativo" e "Engajamento comunidade IADVH".


---

## ✨ 4. Experiência do Usuário (UX) & Animações

* [x] **Efeito Scroll (Reveal):** Adicionar animação de entrada (fade-in/up) nos gráficos da seção "Pódio" à medida que o usuário faz o scroll na página.
* [x] **Modo Tela Cheia:** Adicionar botão de "Expandir" no topo do Dashboard para colocar os dados principais e o ranking em modo Fullscreen.
* [x] **Gamificação (Pódio):** Substituir ícones padrão de ranking por emblemas de medalhas (Ouro #1, Prata #2, Bronze #3).
* [x] **Validação de Formulário:** Tornar obrigatório o preenchimento de pelo menos 1 setor no campo "vagas específicas" ao criar uma nova ação.

---

## 🛠️ 5. Painel Administrativo (Listas)

* [x] **Lista Unificada:** Garantir que a "Lista de Inscritos" carregue todos os dados por padrão e reaja instantaneamente aos filtros de botões ou ações selecionadas sem refresh de página.
* [x] **Calendário Interativo:** Ao clicar em "Desativar" em um dia do calendário, o sistema deve marcar aquele dia como inativo (visual e logicamente).

---

### 💡 Observação para a IA:

> Priorize a consistência dos tipos no TypeScript (se aplicável) e certifique-se de que a máscara do campo WhatsApp siga o padrão brasileiro `(99) 99999-9999`.

---
