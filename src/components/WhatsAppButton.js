function WhatsAppButton() {
  return (
    <a
      className="whatsapp-fab"
      href="https://wa.me/77070000000"
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      title="WhatsApp"
    >
      <img src={`${process.env.PUBLIC_URL || ''}/logo.svg`} alt="" className="whatsapp-fab-logo" />
    </a>
  );
}

export default WhatsAppButton;
