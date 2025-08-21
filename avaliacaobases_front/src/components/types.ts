type Item = { nome: string; conformidade: number };
type ViaturaRequest = {
    placa: string;
    modelo: string;
    ano: string;
    tipoViatura: string;
    statusOperacional: string;
    idBase: number | null;
    itens: Item[];
};
type Viatura = ViaturaRequest & { id?: number };