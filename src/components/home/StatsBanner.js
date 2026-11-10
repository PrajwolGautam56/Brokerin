export default function StatsBanner() {
  return <section className="brand-process brand-container" aria-label="How to get started">{[
    ['01', 'Explore your options', 'Browse homes, furniture and services.'],
    ['02', 'Confirm the details', 'Check availability, charges and terms with our team.'],
    ['03', 'Plan your next step', 'Arrange a visit, delivery or service appointment.']
  ].map(([number, title, copy]) => <div key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></div>)}</section>;
}

