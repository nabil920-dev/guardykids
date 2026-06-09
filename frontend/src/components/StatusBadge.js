import React from 'react';

const labels = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  rejected: 'Refusée',
  cancelled: 'Annulée',
  paid: 'Payé',
  unpaid: 'Non payé',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {labels[status] || status}
    </span>
  );
}
