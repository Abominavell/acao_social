export interface Setor {
    id: string;
    nome: string;
    created_at: string;
}

export interface Colaborador {
    id: string;
    setor_id: string;
    nome: string;
    cpf: string;
    data_nascimento: string;
    is_externo: boolean;
    ativo: boolean;
    created_at: string;
    /** Preenchido nas respostas aninhadas da API (equivalente ao join com setores). */
    setores?: { id: string; nome: string } | null;
}

export interface AcaoSocial {
    id: string;
    titulo: string;
    descricao: string | null;
    data_evento: string;
    vagas_limite: number;
    ativo: boolean;
    created_at: string;
    vagas_por_setor?: Record<string, number> | null;
}

export interface Projeto {
    id: string;
    titulo: string;
    descricao: string | null;
    vagas_limite: number;
    ativo: boolean;
    created_at: string;
}

export interface DataProjeto {
    id: string;
    projeto_id: string;
    data_evento: string;
    vagas_limite: number;
    ativo: boolean;
    created_at: string;
    vagas_por_setor?: Record<string, number> | null;
    projetos?: Projeto;
}

export interface Inscricao {
    id: string;
    projeto_id: string;
    data_projeto_id: string;
    colaborador_id: string;
    confirmado_presenca: boolean;
    created_at: string;
    colaboradores?: Colaborador;
    projetos?: Projeto;
    datas_projeto?: DataProjeto;
}

export interface RankingSetor {
    setor_id: string;
    setor_nome: string;
    participantes_unicos: number;
    total_membros: number;
    taxa_engajamento: number;
    meta_setor?: number;
}
