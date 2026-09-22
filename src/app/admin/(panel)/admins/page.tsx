import { currentAdmin } from "@/lib/auth";
import { db } from "@/lib/store";
import { changeOwnPasswordAction, createAdminAction, removeAdminAction } from "../../actions";
import { Page, Table, Td, fmt } from "../ui";

export default async function Admins() {
  const me = (await currentAdmin())!;
  const d = db.get();
  return (
    <Page title="Admin accounts" sub="Super admins manage everything; managers edit assigned tenant sites and help with onboarding.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><Table head={["Name", "Email", "Role", "Last login", "Sessions", ""]} rows={d.admins.length} empty="">
          {d.admins.map((a) => <tr key={a.id} className="border-t border-line"><Td className="font-medium">{a.name}{a.id === me.id && <span className="tag ml-2">you</span>}</Td><Td>{a.email}</Td><Td className="capitalize">{a.role}</Td><Td>{fmt(a.lastLoginAt)}</Td><Td>{d.sessions.filter((s) => s.kind === "admin" && s.subjectId === a.id).length}</Td><Td>{me.role === "superadmin" && a.id !== me.id && <form action={removeAdminAction}><input type="hidden" name="adminId" value={a.id} /><button className="text-red-600">Remove</button></form>}</Td></tr>)}
        </Table></div>
        <div className="grid gap-6 self-start">
          {me.role === "superadmin" && <form action={createAdminAction} className="card grid gap-3 p-5 text-sm"><h2 className="font-bold">Add admin</h2><input name="name" className="input" placeholder="Name" required /><input name="email" type="email" className="input" placeholder="Email" required /><input name="password" type="text" minLength={8} className="input" placeholder="Temporary password" required /><select name="role" className="input"><option value="manager">Manager</option><option value="superadmin">Super admin</option></select><button className="btn-primary">Create</button></form>}
          <form action={changeOwnPasswordAction} className="card grid gap-3 p-5 text-sm"><h2 className="font-bold">Change my password</h2><input name="password" type="password" minLength={8} className="input" placeholder="New password (8+ chars, a number)" required /><button className="btn-secondary">Update</button></form>
        </div>
      </div>
    </Page>
  );
}
