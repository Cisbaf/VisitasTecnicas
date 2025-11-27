
export type ViaturaRequest = {
    placa: string;
    km: string;
    tipoViatura: string;
    statusOperacional: string;
    idBase: number | null;
};
export type Viatura = ViaturaRequest & {
    id: number,
    dataInclusao: Date,
    dataUltimaAlteracao: string
};

export interface VisitaResponse {
    id: number;
    dataVisita: string;
    idBase: number;
    membros: EquipeTecnica[];
    tipoVisita: String;
}

export interface EquipeTecnica {
    nome: string;
    cargo?: string;
}

export interface UserResponse {
    id: number;
    user: string;
    role: string;
    baseId: number | null;
}

export interface RelatorioConsolidadoResponse {
    dataInicio: string;
    dataFim: string;
    totalVisitas: number;
    pontosFortes: string[];
    pontosCriticosGerais: PontoCriticoDTO[];
    mediasConformidade: { [categoria: string]: number };
    conformidadesPorSummary: { [summary: number]: number };
    viaturasCriticas: ViaturaDTO[];
    rankingBases: BaseRankingDTO[];
    conformidadeDetalhada: { [categoria: string]: CategoryConformanceDTO };
    percentualItensForaConformidade: number;
    metricasExternasBases: BaseMetricasExternasDTO[];
}
interface BaseMetricasExternasDTO {
    baseNome: string;
    idBase: number;
    porcentagemVtrAtiva: number;
    tempoMedioProntidao: number;
    tempoMedioAtendimento: number;
    mediaConformidade: number;
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
    tipoViatura: string;
    km: string;
    dataUltimaAlteracao: string;
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
    score: number
}

export interface RelatoResponse {
    id: number;
    autor: string;
    mensagem: string;
    tema: string;
    data: Date;
    baseId: number;
}

export interface BaseResponse {
    id: number;
    nome: string;
    endereco: string;
    telefone: string;
    email: string;
    bairro: string;
    municipio: string;
}

export type BaseRequest = {
    id?: number;
    nome?: string;
    bairro?: string;
    municipio?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
};


export interface Avaliacao {
    id: number;
    idVisita: number;
    idViatura: number;
    idCheckList: number;
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
    baseId: number;
    mensagem: string;
    autor: string;
    data: string;
    visitaId: number;
}

export interface VisitaDetails {
    id: number;
    dataVisita: string; // YYYY-MM-DD
    membros: EquipeTecnica[];
    tipoVisita?: string;
}

export interface CategoriaAgrupada {
    categoriaId: number;
    categoria: string;
    ultimaVisita: string;
    visitas: {
        visitaId: number;
        dataVisita: string;
        tipoVisita: String;
    }[];
}

export interface Summary {
    id: number;
    titulo: string;
}
export interface FormCategory {
    id?: number;
    categoria: string;
    summaryId?: number;
    campos: FormField[];
    tipoForm: string;
}

export interface FormField {
    id?: number;
    titulo: string;
    tipo: 'TEXTO' | 'CHECKBOX';
    formId?: number;
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


export type Flag = "GREEN" | "YELLOW" | "RED" | null;

export interface Midia {
    id: number;
    tipoArquivo: string;
    base64DataUrl: string | null;
    dataUpload: string;
    idVisita: number | null;
    flag?: Flag;
}



export interface CategoryData {
    conforme?: string | number;
    parcial?: string | number;
    naoConforme?: string | number;
    naoAvaliado?: string | number;
    total?: number;
}

export interface Preenchimentos {
    dia: string;
    nomes: string;
}

export interface Veiculo {
    identificacao: string;
    km: string;
    preenchimentos: Preenchimentos[]
}

export const PREDEFINED_SUMMARIES: Summary[] = [
    { id: 1, titulo: "MANUTENÇÃO DA PADRONIZAÇÃO DA ESTRUTURA FÍSICA DA BASE DESCENTRALIZADA" },
    { id: 2, titulo: "PADRONIZAÇÃO VISUAL DOS UNIFORMES DAS EQUIPES E DA BASE DESCENTRALIZADA" },
    { id: 4, titulo: "CONDIÇÕES DE FUNCIONAMENTO DO SERVIÇO" },
    { id: 5, titulo: "CHEK LIST DAS UNIDADES MOVÉIS" },
];