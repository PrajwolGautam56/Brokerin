export function trackLead(channel, details = {}) {
  const event = { event: 'brokerin_lead', channel, ...details };
  window.dispatchEvent(new CustomEvent('brokerin:lead', { detail: event }));
  // Integrate with an existing consent-managed tag manager, when configured.
  if (Array.isArray(window.dataLayer)) window.dataLayer.push(event);
}
