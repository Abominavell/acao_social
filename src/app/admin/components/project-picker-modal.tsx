import type { DataProjeto, Projeto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Table, Td, Th } from "@/components/ui/table";

type ProjectPickerModalProps = {
  open: boolean;
  projetos: Projeto[];
  datasProjetos: DataProjeto[];
  onClose: () => void;
  onSelectProject: (projeto: Projeto) => void;
};

export function ProjectPickerModal({
  open,
  projetos,
  datasProjetos,
  onClose,
  onSelectProject,
}: ProjectPickerModalProps) {
  return (
    <Modal open={open} title="Selecionar projeto para alterar" onClose={onClose}>
      {projetos.length === 0 ? (
        <p className="text-sm text-text-secondary">Nenhum projeto cadastrado.</p>
      ) : (
        <div className="max-h-72 overflow-y-auto">
          <Table>
            <thead>
              <tr>
                <Th>Projeto</Th>
                <Th>Ações cadastradas</Th>
                <Th>Status</Th>
                <Th className="text-right">Ação</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projetos.map((projeto) => (
                <tr key={projeto.id}>
                  <Td className="text-text-primary">{projeto.titulo}</Td>
                  <Td className="text-xs text-text-secondary">
                    {(() => {
                      const datasDoProjeto = datasProjetos
                        .filter((d) => d.projeto_id === projeto.id)
                        .sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime());
                      if (datasDoProjeto.length === 0) return "Sem ações";
                      const preview = datasDoProjeto.slice(0, 3);
                      const restante = datasDoProjeto.length - preview.length;
                      return (
                        <div className="space-y-1">
                          <p className="font-semibold text-text-primary text-xs">{datasDoProjeto.length} ação(ões)</p>
                          {preview.map((d) => (
                            <p key={d.id}>
                              {new Date(d.data_evento).toLocaleDateString("pt-BR")}{" "}
                              {new Date(d.data_evento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}{" "}
                              • {d.vagas_limite} vagas
                            </p>
                          ))}
                          {restante > 0 && <p>+ {restante} ação(ões)</p>}
                        </div>
                      );
                    })()}
                  </Td>
                  <Td>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        projeto.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {projeto.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <Button variant="outline" size="sm" onClick={() => onSelectProject(projeto)}>
                      Alterar
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Modal>
  );
}
