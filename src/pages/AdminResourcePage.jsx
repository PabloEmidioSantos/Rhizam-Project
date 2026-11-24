import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { getErrorMessage } from "../lib/errors.js";
import { listClients, createClient, updateClient, deleteClient } from "../services/clientService.js";
import { listContactRequests, updateContactRequest, deleteContactRequest } from "../services/contactRequestService.js";
import { listProjects, createProject, updateProject, deleteProject } from "../services/projectService.js";
import { listProjectUpdates, createProjectUpdate, updateProjectUpdate, deleteProjectUpdate } from "../services/projectUpdateService.js";
import { Feedback, LoadingState } from "../components/Feedback.jsx";

const resourceDefinitions = {
  requests: {
    title: "Solicitações de contato",
    resource: "requests",
    fields: [{ key: "status", label: "Status", type: "select", required: true, options: ["new", "contacted", "qualified", "closed", "spam"] }],
    columns: [["name", "Nome"], ["email", "E-mail"], ["company", "Empresa"], ["message", "Mensagem"], ["status", "Status"], ["created_at", "Recebida"]],
    canCreate: false,
  },
  clients: {
    title: "Clientes",
    resource: "clients",
    fields: [
      { key: "name", label: "Nome", required: true, maxLength: 160 },
      { key: "email", label: "E-mail", type: "email", required: true, maxLength: 254 },
      { key: "company", label: "Empresa", maxLength: 160 },
      { key: "auth_user_id", label: "ID do usuário Auth (opcional)", help: "Crie ou convide o usuário pelo Supabase Auth; cole aqui o UUID para liberar a área do cliente.", pattern: "^[0-9a-fA-F-]{36}$" },
    ],
    columns: [["name", "Nome"], ["email", "E-mail"], ["company", "Empresa"], ["auth_user_id", "Usuário vinculado"]],
  },
  projects: {
    title: "Projetos e portfólio",
    resource: "projects",
    fields: [
      { key: "client_id", label: "ID do cliente", required: true, pattern: "^[0-9a-fA-F-]{36}$", help: "UUID do perfil do cliente." },
      { key: "title", label: "Título", required: true, maxLength: 180 },
      { key: "description", label: "Descrição interna", type: "textarea", maxLength: 5000 },
      { key: "public_summary", label: "Resumo público", type: "textarea", maxLength: 1000, help: "Somente será publicado quando o projeto estiver concluído e marcado para o portfólio." },
      { key: "status", label: "Status", type: "select", required: true, options: ["planning", "in_progress", "review", "completed", "paused"] },
      { key: "progress", label: "Andamento (%)", type: "number", required: true, min: 0, max: 100 },
      { key: "is_portfolio", label: "Publicar no portfólio", type: "checkbox" },
    ],
    columns: [["title", "Projeto"], ["client_id", "Cliente"], ["status", "Status"], ["progress", "Andamento"], ["is_portfolio", "Portfólio"]],
  },
  updates: {
    title: "Atualizações de projetos",
    resource: "updates",
    fields: [
      { key: "project_id", label: "ID do projeto", required: true, pattern: "^[0-9a-fA-F-]{36}$", help: "UUID do projeto." },
      { key: "title", label: "Título", required: true, maxLength: 180 },
      { key: "body", label: "Atualização", type: "textarea", required: true, minLength: 3, maxLength: 5000 },
      { key: "is_visible_to_client", label: "Compartilhar com o cliente", type: "checkbox" },
    ],
    columns: [["project_id", "Projeto"], ["title", "Título"], ["body", "Atualização"], ["is_visible_to_client", "Visível"]],
  },
};

const resourceServices = {
  requests: { list: listContactRequests, update: updateContactRequest, delete: deleteContactRequest },
  clients: { list: listClients, create: createClient, update: updateClient, delete: deleteClient },
  projects: { list: listProjects, create: createProject, update: updateProject, delete: deleteProject },
  updates: { list: listProjectUpdates, create: createProjectUpdate, update: updateProjectUpdate, delete: deleteProjectUpdate },
};

function emptyValues(definition) {
  return Object.fromEntries(definition.fields.map((field) => [field.key, field.type === "checkbox" ? false : field.type === "number" ? "0" : ""]));
}

function formatValue(value, key) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (key === "created_at") return new Date(value).toLocaleString("pt-BR");
  return String(value);
}

export default function AdminResourcePage() {
  const { resource: resourceKey } = useParams();
  const definition = resourceDefinitions[resourceKey];
  const service = resourceServices[resourceKey];
  const { data, loading, error, reload } = useAsyncData(() => service.list(), [resourceKey]);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(() => definition ? emptyValues(definition) : {});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!definition) return <section><h1>Recurso não encontrado</h1><p>Selecione uma opção no menu administrativo.</p></section>;

  function startCreate() {
    setEditing("new");
    setValues(emptyValues(definition));
    setFormError("");
  }

  function startEdit(row) {
    setEditing(row.id);
    setValues(Object.fromEntries(definition.fields.map((field) => [field.key, row[field.key] ?? (field.type === "checkbox" ? false : "")])));
    setFormError("");
  }

  async function handleSave(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setSaving(true);
    setFormError("");
    const payload = Object.fromEntries(definition.fields.map((field) => {
      const value = values[field.key];
      if (field.type === "checkbox") return [field.key, Boolean(value)];
      if (field.type === "number") return [field.key, Number(value)];
      return [field.key, value.trim() || null];
    }));

    try {
      if (editing === "new") await service.create(payload);
      else await service.update(editing, payload);
      setEditing(null);
      await reload();
    } catch (saveError) {
      setFormError(getErrorMessage(saveError, "Não foi possível salvar. Verifique os dados e as permissões."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Excluir "${row.title || row.name || row.email}"? Esta ação não pode ser desfeita.`)) return;
    setFormError("");
    try {
      await service.delete(row.id);
      await reload();
    } catch (deleteError) {
      setFormError(getErrorMessage(deleteError, "Não foi possível excluir este registro."));
    }
  }

  return (
    <section>
      <div className="admin-page-heading"><div><p className="admin-label">GERENCIAMENTO</p><h1>{definition.title}</h1><p>As alterações são salvas no banco de dados do Supabase.</p></div><div className="admin-actions"><button className="subtle-button" type="button" onClick={reload}>Atualizar</button>{definition.canCreate !== false && <button className="primary-button" type="button" onClick={startCreate}>Novo registro +</button>}</div></div>
      <Feedback>{formError}</Feedback>
      {editing && <form className="record-form" onSubmit={handleSave}><div className="record-form-heading"><h2>{editing === "new" ? "Novo registro" : "Editar registro"}</h2><button className="subtle-button" type="button" onClick={() => setEditing(null)}>Fechar</button></div><div className="record-fields">{definition.fields.map((field) => <label className={field.type === "checkbox" ? "checkbox-field" : ""} key={field.key}>{field.type === "checkbox" ? <><input type="checkbox" checked={Boolean(values[field.key])} onChange={(event) => setValues({ ...values, [field.key]: event.target.checked })} />{field.label}</> : <>{field.label}{field.type === "select" ? <select required={field.required} value={values[field.key] ?? ""} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}><option value="">Selecione…</option>{field.options.map((option) => <option value={option} key={option}>{option.replaceAll("_", " ")}</option>)}</select> : field.type === "textarea" ? <textarea value={values[field.key] ?? ""} required={field.required} minLength={field.minLength} maxLength={field.maxLength} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} /> : <input type={field.type ?? "text"} value={values[field.key] ?? ""} required={field.required} min={field.min} max={field.max} maxLength={field.maxLength} pattern={field.pattern} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} />}{field.help && <small>{field.help}</small>}</>}</label>)}</div><button className="primary-button" type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button></form>}
      {loading && <LoadingState />}
      {error && <Feedback>{error}</Feedback>}
      {!loading && !error && !data?.length && <p className="empty-state">Nenhum registro encontrado.</p>}
      {!loading && Boolean(data?.length) && <div className="data-table-wrap"><table className="data-table"><thead><tr>{definition.columns.map(([key, label]) => <th key={key}>{label}</th>)}<th>Ações</th></tr></thead><tbody>{data.map((row) => <tr key={row.id}>{definition.columns.map(([key]) => <td key={key} className={key === "message" || key === "body" ? "long-cell" : ""}>{formatValue(row[key], key)}</td>)}<td><div className="table-actions"><button type="button" onClick={() => startEdit(row)}>Editar</button><button type="button" onClick={() => void handleDelete(row)}>Excluir</button></div></td></tr>)}</tbody></table></div>}
    </section>
  );
}
