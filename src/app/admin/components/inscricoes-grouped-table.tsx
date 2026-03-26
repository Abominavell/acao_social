import type { Inscricao } from "@/lib/types";
import { Table, Td, Th } from "@/components/ui/table";

type Grouped = [string, { projeto?: { titulo?: string }; items: Inscricao[] }];

type Props = {
  groups: Grouped[];
  expandedProjetoId: string | null;
  onToggleExpand: (id: string) => void;
  onTogglePresenca: (id: string, current: boolean) => void;
  formatDate: (dateStr: string) => string;
  parseExternoName: (nome: string) => { name: string; unit: string };
};

export function InscricoesGroupedTable({
  groups,
  expandedProjetoId,
  onToggleExpand,
  onTogglePresenca,
  formatDate,
  parseExternoName,
}: Props) {
  return (
    <div className="space-y-6 p-4">
      {groups.map(([projetoId, group]) => (
        <div key={projetoId} className="border border-gray-100 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onToggleExpand(projetoId)}
            className="w-full bg-gray-50 px-4 py-3 border-b border-gray-100 text-left flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-text-primary">{group.projeto?.titulo || "Projeto não identificado"}</p>
              <p className="text-xs text-text-secondary">{group.items.length} inscrito(s)</p>
            </div>
            <span className="text-xs font-semibold text-primary">{expandedProjetoId === projetoId ? "Ocultar" : "Ver inscrições"}</span>
          </button>

          {expandedProjetoId === projetoId && (
            <Table className="rounded-none border-0">
              <thead>
                <tr className="bg-white text-left">
                  <Th className="px-4">Voluntário</Th>
                  <Th className="px-4">Setor</Th>
                  <Th className="px-4">Tipo</Th>
                  <Th className="px-4">Data Inscrição</Th>
                  <Th className="px-4">Data Evento</Th>
                  <Th className="px-4 text-center">Presença</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {group.items.map((insc) => {
                  const colab = insc.colaboradores as unknown as { is_externo: boolean; nome: string; setores?: { nome: string } | null };
                  const externoInfo = colab?.is_externo ? parseExternoName(colab.nome) : null;
                  const displayName = externoInfo ? externoInfo.name : colab?.nome || "—";
                  const displaySetor = externoInfo ? externoInfo.unit : colab?.setores?.nome || "—";
                  return (
                    <tr key={insc.id} className={`transition-colors ${insc.confirmado_presenca ? "bg-green-50" : "hover:bg-gray-50"}`}>
                      <Td className="px-4 py-3">
                        <span className="font-medium text-text-primary">{displayName}</span>
                      </Td>
                      <Td className="px-4 py-3 text-sm text-text-secondary">{displaySetor}</Td>
                      <Td className="px-4 py-3">
                        {colab?.is_externo ? <span className="badge badge-warning">Externo</span> : <span className="badge badge-success">Interno</span>}
                      </Td>
                      <Td className="px-4 py-3 text-sm text-text-secondary">{formatDate(insc.created_at)}</Td>
                      <Td className="px-4 py-3 text-sm text-text-secondary">{insc.datas_projeto?.data_evento ? formatDate(insc.datas_projeto.data_evento) : "—"}</Td>
                      <Td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onTogglePresenca(insc.id, insc.confirmado_presenca)}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${insc.confirmado_presenca ? "bg-primary" : "bg-gray-300"}`}
                          title={insc.confirmado_presenca ? "Presença confirmada" : "Confirmar presença"}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${insc.confirmado_presenca ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      ))}
    </div>
  );
}
