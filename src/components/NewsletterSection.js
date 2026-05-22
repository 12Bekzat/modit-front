import { useState } from 'react';

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setMessage('Укажите email, чтобы получать подборки и акции.');
      return;
    }

    setMessage(`Адрес ${email.trim()} добавлен в список рассылки.`);
    setEmail('');
  };

  return (
    <section className="section newsletter">
      <div className="container newsletter-inner">
        <div>
          <h2>Персональные предложения в почте</h2>
          <p>Получайте закрытые акции и подборки в своем стиле.</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="accent-button" type="submit">
            Подписаться
          </button>
        </form>
        {message ? <p className="muted-text">{message}</p> : null}
      </div>
    </section>
  );
}

export default NewsletterSection;
