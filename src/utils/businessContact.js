export const businessContact = {
  phone: '+91 83106 52049',
  telephone: '+918310652049',
  whatsapp: '918310652049',
  secondaryPhone: '+91 88847 04449',
  email: 'info@brokerin.in',
  address: 'Udayapalya, Kanakapura Road, Bengaluru, Karnataka'
};
export const whatsappLink = (message = 'Hello BrokerIn, I would like to discuss a property, furniture or home service enquiry.') =>
  `https://wa.me/${businessContact.whatsapp}?text=${encodeURIComponent(message)}`;
