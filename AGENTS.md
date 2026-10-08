<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Store data (products, orders, matcher options, store settings) lives in Lovable Cloud; public tables are read with the browser client via react-query options in `src/lib/store-queries.ts` — keeps one source of truth.
- Orders are created only by the `placeOrder` server fn, which recomputes prices from the database — never trust client totals.
- Admin writes go through the browser client under RLS gated by `has_role(..., 'admin')`; the first signed-up account is auto-granted admin by a trigger.
- WhatsApp order alerts are sent server-side via Fonnte (`FONNTE_TOKEN`) to the number in store settings — owner can change the number without code.
- Store name, WhatsApp number, address and ETAs come from the `store_settings` row, not hardcoded copy.
