import { inr } from "@/lib/catalogue";
import { allThemes } from "@/lib/themes";
import { db } from "@/lib/store";
import { createCoupon, deleteCoupon } from "../../actions";
import { Page, Table, Td } from "../ui";

export default function Coupons() {
  const d = db.get();
  return (
    <Page title="Coupons" sub="Percentage or flat discounts with expiry, usage limits and optional theme restriction.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><Table head={["Code", "Value", "Expires", "Used", "Theme", ""]} rows={d.coupons.length} empty="No coupons.">
          {d.coupons.map((c) => <tr key={c.code} className="border-t border-line"><Td className="font-mono font-semibold">{c.code}</Td><Td>{c.kind === "percent" ? `${c.value}%` : inr(c.value)}</Td><Td>{c.expiresAt}</Td><Td>{c.used}/{c.usageLimit}</Td><Td>{c.themeId ?? "Any"}</Td><Td><form action={deleteCoupon}><input type="hidden" name="code" value={c.code} /><button className="text-red-600">Delete</button></form></Td></tr>)}
        </Table></div>
        <form action={createCoupon} className="card grid gap-3 self-start p-5 text-sm"><h2 className="font-bold">New coupon</h2><input name="code" className="input" placeholder="CODE" required /><div className="flex gap-2"><select name="kind" className="input"><option value="percent">Percent</option><option value="flat">Flat ₹</option></select><input name="value" type="number" className="input" placeholder="20" required /></div><input name="expiresAt" type="date" className="input" defaultValue="2027-03-31" /><input name="usageLimit" type="number" className="input" placeholder="Usage limit" defaultValue={100} /><select name="themeId" className="input"><option value="">Any theme</option>{allThemes().map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select><button className="btn-primary">Create</button></form>
      </div>
    </Page>
  );
}
