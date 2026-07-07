import { useEffect, useState } from 'react';
import Drawer from './Drawer';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import VerterWidget from './VerterWidget';
import {
  drawerBuyerLinks,
  footerBuyerLinks,
  footerContacts
} from '../data/storeData';
import { allowedCatalogCategories, buildAllowedCategoryNavigation } from '../data/allowedCategories';
import { fetchCategoryNavigation } from '../services/productApi';

function MainLayout({ children, showCategoryBar = true }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catalogLinks, setCatalogLinks] = useState(allowedCatalogCategories);
  const [catalogNavigation, setCatalogNavigation] = useState(buildAllowedCategoryNavigation());

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [drawerOpen]);

  useEffect(() => {
    let cancelled = false;

    const loadCatalogLinks = async () => {
      try {
        const navigationResponse = await fetchCategoryNavigation();

        if (cancelled) {
          return;
        }

        const nextNavigation = buildAllowedCategoryNavigation(navigationResponse);
        setCatalogNavigation(nextNavigation);
        setCatalogLinks(nextNavigation.map((item) => item.name));
      } catch {
        if (!cancelled) {
          const fallbackNavigation = buildAllowedCategoryNavigation();
          setCatalogNavigation(fallbackNavigation);
          setCatalogLinks(fallbackNavigation.map((item) => item.name));
        }
      }
    };

    loadCatalogLinks();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app">
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navLinks={catalogLinks}
        buyerLinks={drawerBuyerLinks}
      />
      <Header
        categories={catalogNavigation}
        onOpenDrawer={() => setDrawerOpen(true)}
        showCategoryBar={showCategoryBar}
      />
      <main>{children}</main>
      <Footer
        footerCatalogLinks={catalogLinks}
        footerBuyerLinks={footerBuyerLinks}
        footerContacts={footerContacts}
      />
      <VerterWidget />
      <WhatsAppButton />
    </div>
  );
}

export default MainLayout;
