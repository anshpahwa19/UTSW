/* ---------- Planned pages: say what the page will do and what it needs. No form controls, so nothing is dead. ---------- */
function plannedView(route, params, role) {
  const item = route.item;
  const title = route.parent && params.id ? `${route.title}: ${params.id}` : route.title;
  const status = item.discovery ? 'Requires discovery and approval' : `Planned – Phase ${item.phase}`;
  const lede = item.discovery
    ? 'The approved scope does not define this page yet. It will only be designed once UTSW confirms what it covers. Nothing here is a committed feature.'
    : `This page is part of Phase ${item.phase}, ${PHASE_NAMES[item.phase].toLowerCase()}. It isn’t built yet, so it has no controls.`;
  const qs = (item.needs || []).filter(n => OPEN_QUESTIONS[n]);
  return `<div class="page">
    ${pageHead({ crumbs: crumbsFor(route), title, badges: badge('planned', status), lede })}
    <div class="planned-grid">
      ${card({ title: item.discovery ? 'Possible scope, to be confirmed' : 'What this page will do', titleId: 'pl-will', body: `<ul class="ticks">${item.will.map(w => `<li>${ic('check_small', 20)}<span>${esc(w)}</span></li>`).join('')}</ul>` })}
      ${card({ title: 'Needed from UTSW first', titleId: 'pl-needs', body: qs.length
        ? `<ul class="qs">${qs.map(n => `<li><span class="q-n">§10.${n}</span><span>${esc(OPEN_QUESTIONS[n])}</span></li>`).join('')}</ul><p class="muted">From the open questions in HANDOVER.md, also listed in admin/README.md.</p>`
        : '<p>Confirmed scope for platform operations and location-aware configuration (HANDOVER §8, Phase 6). Credential management, advanced observability, geofencing, beacons and AI administration are not MVP features.</p>' })}
      ${card({ title: 'Your access', titleId: 'pl-access', body: `<p><b>${esc(ROLES[role].label)}:</b> ${esc(LEVEL_LABEL[levelOf(role, item.area)])}</p><p class="muted">From the proposed permission matrix, pending confirmation.</p>` })}
    </div>
    ${route.parent ? `<p><a class="text-link" href="#${route.parent.route}">${ic('arrow_back', 20)}Back to ${esc(route.parent.label)}</a></p>` : ''}
    <p class="muted built-note">${ic('info', 20)}<span>Built so far: <a class="text-link" href="#home-layout">Home screen layout</a>, which shows the shell, components, mock services, preview and publishing workflow that later pages reuse.</span></p>
  </div>`;
}
