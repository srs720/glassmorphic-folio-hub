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

- Use the shared Reveal/Stagger primitives for portfolio scroll motion and honor reduced-motion preferences so all content remains accessible.
- Use the semantic portfolio-card utility for compact hobbies and certificate controls so their border, lift, and shadow behavior stays consistent.
- Contact and CV requests are saved through public server functions using the publishable client with RLS, then notify Telegram server-side; failed or duplicate saves never send alerts, and notification failures never undo a save.
- Keep CRM contacts and events in dedicated tables with administrator-only row access; expose only explicitly public profile and event fields through narrow security-definer read functions, because private birthdays and biographies must not leak through public table reads.
