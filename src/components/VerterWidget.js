import { useEffect } from 'react';

const VERTER_SCRIPT_URL = process.env.REACT_APP_VERTER_WIDGET_SCRIPT_URL || 'https://ai.al-style.kz/widget.js';
const VERTER_API_URL = process.env.REACT_APP_VERTER_WIDGET_API_URL || 'https://ai.al-style.kz';

function VerterWidget() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    document.body.classList.add('has-verter-widget');
    document.documentElement.style.setProperty(
      '--modit-widget-logo',
      `url("${process.env.PUBLIC_URL || ''}/logo.svg")`
    );

    const initializeWidget = () => {
      if (!window.VerterWidget?.init || window.__moditVerterWidgetInitialized) {
        return;
      }

      window.VerterWidget.init({
        apiUrl: VERTER_API_URL
      });
      window.__moditVerterWidgetInitialized = true;
    };

    if (window.VerterWidget?.init) {
      initializeWidget();
      return undefined;
    }

    let script = document.querySelector('script[data-verter-widget="true"]');
    if (!script) {
      script = document.createElement('script');
      script.src = VERTER_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.dataset.verterWidget = 'true';
      document.body.appendChild(script);
    }

    script.addEventListener('load', initializeWidget);
    return () => {
      script.removeEventListener('load', initializeWidget);
    };
  }, []);

  return null;
}

export default VerterWidget;
