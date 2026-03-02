export interface Setor {
    id: string;
    nome: string;
    created_at: string;
}

export interface Colaborador {
    id: string;
    setor_id: string;
    nome: string;
    is_externo: boolean;
    created_at: string;
}

export interface AcaoSocial {
    id: string;
    titulo: string;
    descricao: string | null;
    data_evento: string;
    vagas_limite: number;
    ativo: boolean;
    created_at: string;
}

export interface Inscricao {
    id: string;
    acao_id: string;
    colaborador_id: string;
    confirmado_presenca: boolean;
    created_at: string;
    colaboradores?: Colaborador;
    acoes_sociais?: AcaoSocial;
}

export interface RankingSetor {
    setor_id: string;
    setor_nome: string;
    participantes_unicos: number;
    total_membros: number;
    taxa_engajamento: number;
}
