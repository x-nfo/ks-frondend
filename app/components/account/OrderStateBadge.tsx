

type OrderState =
  | 'Created'
  | 'Draft'
  | 'AddingItems'
  | 'ArrangingPayment'
  | 'PaymentAuthorized'
  | 'PaymentSettled'
  | 'PartiallyShipped'
  | 'Shipped'
  | 'PartiallyDelivered'
  | 'Delivered'
  | 'Modifying'
  | 'ArrangingAdditionalPayment'
  | 'Cancelled';

const stateMapping: Record<string, string> = {
  Created: 'Created',
  Draft: 'Draft',
  AddingItems: 'Adding Items',
  ArrangingPayment: 'Arranging Payment',
  PaymentAuthorized: 'Payment Authorized',
  PaymentSettled: 'Payment Settled',
  PartiallyShipped: 'Partially Shipped',
  Shipped: 'Shipped',
  PartiallyDelivered: 'Partially Delivered',
  Delivered: 'Delivered',
  Modifying: 'Modifying',
  ArrangingAdditionalPayment: 'Arranging Additional Payment',
  Cancelled: 'Cancelled',
};

export function OrderStateBadge({ state }: { state?: string }) {
  let colorClasses = '';
  switch (state as OrderState) {
    default:
    case 'Draft':
    case 'AddingItems':
      colorClasses = 'bg-gray-100 text-gray-800';
      break;
    case 'PaymentAuthorized':
    case 'PaymentSettled':
    case 'Shipped':
      colorClasses = 'bg-blue-100 text-blue-800';
      break;
    case 'Delivered':
      colorClasses = 'bg-green-100 text-green-800';
      break;
    case 'PartiallyShipped':
    case 'PartiallyDelivered':
    case 'Modifying':
    case 'ArrangingPayment':
    case 'ArrangingAdditionalPayment':
      colorClasses = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Cancelled':
      colorClasses = 'bg-red-100 text-red-800';
      break;
  }

  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded uppercase whitespace-nowrap ${colorClasses}`}
    >
      {state ? (stateMapping[state] ?? state) : 'Unknown'}
    </span>
  );
}
