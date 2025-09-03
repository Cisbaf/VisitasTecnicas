export type Item = { nome: string; conformidade: number };

export type ViaturaRequest = {
    placa: string;
    modelo: string;
    ano: string;
    tipoViatura: string;
    statusOperacional: string;
    idBase: number | null;
    itens: Item[];
};
export type Viatura = ViaturaRequest & { id: number };

export interface VisitaResponse {
    id: number;
    dataVisita: string;
    idBase: number;
    membros: EquipeTecnica[];
}

export interface EquipeTecnica {
    nome: string;
    cargo?: string;
}

export interface CheckListResponse {
    id: number;
    categoria: string;
    descricao: CheckDescription[];
}

export interface CheckDescription {
    id: number;
    descricao: string;
    conformidadePercent: number;
    observacao: string;
    tipoConformidade: string;
    criticidade: string;
    visitaId: number;
    viaturaId: number;
}

export interface CheckListRequest {
    categoria: string;
    descricao: CheckDescription[];
    visitaId: number;
}

export interface RelatorioConsolidadoResponse {
    dataInicio: string;
    dataFim: string;
    totalVisitas: number;
    pontosFortes: string[];
    pontosCriticosGerais: PontoCriticoDTO[];
    mediasConformidade: { [categoria: string]: number };
    viaturasCriticas: ViaturaDTO[];
    rankingBases: BaseRankingDTO[];
    conformidadeDetalhada: { [categoria: string]: CategoryConformanceDTO };
    percentualItensForaConformidade: number;
}

export interface CategoryConformanceDTO {
    categoria: string;
    mediaPercentTrue: number;
    mediaPercentFalse: number;
    mediaPercentNotGiven: number;
    percentualCamposForaConformidade: number;
}

export interface PontoCriticoDTO {
    descricao: string;
    ocorrencias: number;
}

export interface ViaturaDTO {
    placa: string;
    modelo: string;
    status: string;
    itensCriticos: ItemViaturaDTO[];
}

export interface ItemViaturaDTO {
    nome: string;
    conformidade: number;
}

export interface BaseRankingDTO {
    nomeBase: string;
    id: number;
    mediaConformidade: number;
    dataUltimaVisita: string;
    posicaoRanking: number;
}

export interface RelatoResponse {
    id: number;
    autor: string;
    mensagem: string;
    tema: string;
    gestorResponsavel: string;
    data: Date;
    resolvido: boolean;
    baseId: number;
}

export interface BaseResponse {
    id: number;
    nome: string;
    endereco: string;
    tipoBase: string;
}

export interface Avaliacao {
    id: number;
    idVisita: number;
    idViatura: number;
    idCheckList: number;
}

export interface DashboardData {
    viaturas: Viatura[];
    visitas: VisitaResponse[];
    relatorios: RelatorioConsolidadoResponse[];
    checklists: CheckListResponse[];
    relatos: RelatoDTO[];
    equipe: any[];
    indicadores: IndicadoresDTO;
}

export interface IndicadoresDTO {
    indiceSaude: number;
    conformidadeGeral: number;
    viaturasOperacionais: number;
    profissionaisAtivos: number;
    tempoRespostaMedio: number;
    adesaoCodigoJ4: number;
}

export interface RelatoDTO {
    id: number;
    tema: string;
    mensagem: string;
    autor: string;
    data: string;
    resolvido: boolean;
    prioridade: 'alta' | 'media' | 'baixa';
    gestorResponsavel?: string;
    baseId: number;
    visitas: number;
}

export interface VisitaDetails {
    id: number;
    dataVisita: string; // YYYY-MM-DD
    membros: EquipeTecnica[];
    observacoes?: string;
}

export interface CategoriaAgrupada {
    categoriaId: number;
    categoria: string;
    ultimaVisita: string;
    visitas: {
        visitaId: number;
        dataVisita: string;
        descricoes: CheckDescription[];
    }[];
}

export interface FormCategory {
    id?: number;
    categoria: string;
    campos: FormField[];
}

export interface FormField {
    id?: number;
    titulo: string;
    tipo: 'TEXTO' | 'CHECKBOX';
    formId?: number;
}

export interface RespostaRequest {
    texto: string;
    checkbox: CheckBox;
    visitaId: number;
}

export interface RespostaResponse {
    id: number;
    campoId: number;
    texto: string;
    checkbox: CheckBox;
    visitaId: number;
}

enum CheckBox {
    TRUE = 'TRUE',
    FALSE = 'FALSE',
    NOT_GIVEN = 'NOT_GIVEN'
}