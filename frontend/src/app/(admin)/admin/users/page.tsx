"use client";

import { useEffect, useState, type FormEvent } from "react";
import { UserCog, Plus } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { DataState } from "@/components/admin/Shared/DataState";

type StaffUser = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: { name: string }[];
};
type Paginated<T> = { data: T[] };

const emptyDraft = { name: "", email: "", phone: "", password: "", password_confirmation: "", role: "content-manager" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<StaffUser[] | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    apiFetch<Paginated<StaffUser>>("/users")
      .then((res) => setUsers(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load staff accounts"));
  }

  useEffect(() => {
    load();
    apiFetch<string[]>("/users/roles").then(setRoles).catch(() => setRoles([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiFetch("/users", { method: "POST", body: draft });
      setFormOpen(false);
      setDraft(emptyDraft);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create staff account");
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(id: number, role: string) {
    try {
      await apiFetch(`/users/${id}/role`, { method: "PATCH", body: { role } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update role");
    }
  }

  async function toggleActive(user: StaffUser) {
    try {
      await apiFetch(`/users/${user.id}/status`, { method: "PATCH", body: { is_active: !user.is_active } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Staff Management"
        title="Users"
        action={
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-sm bg-ink-900 px-4 py-2.5 text-sm font-medium text-parchment-50 hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" /> New Staff Account
          </button>
        }
      />

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Name</label>
              <input
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Email</label>
              <input
                type="email"
                required
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Password</label>
              <input
                type="password"
                required
                value={draft.password}
                onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Confirm Password</label>
              <input
                type="password"
                required
                value={draft.password_confirmation}
                onChange={(e) => setDraft({ ...draft, password_confirmation: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Role</label>
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          {formError && <p className="text-sm text-clay-600">{formError}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-forest-600 px-5 py-2.5 text-sm font-medium text-parchment-50 hover:bg-forest-700 disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create Account"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-sm border border-ink-900/15 px-5 py-2.5 text-sm text-graphite-700 hover:border-ink-900/30"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <DataState
        loading={users === null}
        empty={users?.length === 0}
        error={error}
        emptyIcon={UserCog}
        emptyText="No staff accounts yet."
      />

      {users && users.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-sm border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-parchment-100 text-xs uppercase tracking-wide text-graphite-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 bg-parchment-50">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{u.name}</td>
                  <td className="px-4 py-3 text-graphite-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.roles[0]?.name ?? ""}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="rounded-sm border border-ink-900/15 bg-parchment-100 px-2 py-1 text-xs outline-none focus:border-forest-600"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wide ${
                        u.is_active ? "bg-forest-600/10 text-forest-700" : "bg-clay-500/10 text-clay-600"
                      }`}
                    >
                      {u.is_active ? "Active" : "Deactivated"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
