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
import { fetchCategoryNavigation, fetchProductFilters } from '../services/productApi';

function MainLayout({ children, showCategoryBar = true }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catalogLinks, setCatalogLinks] = useState([]);
  const [catalogNavigation, setCatalogNavigation] = useState([]);

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
        const [navigationResponse, filterResponse] = await Promise.all([
          fetchCategoryNavigation(),
          fetchProductFilters()
        ]);

        if (cancelled) {
          return;
        }

        if (Array.isArray(navigationResponse) && navigationResponse.length > 0) {
          setCatalogNavigation(navigationResponse);
          setCatalogLinks(navigationResponse.map((item) => item.name));
          return;
        }

        if (Array.isArray(filterResponse.categories) && filterResponse.categories.length > 0) {
          setCatalogLinks(filterResponse.categories);
          setCatalogNavigation(
            filterResponse.categories.map((name, index) => ({
              id: `filter-${index}`,
              name,
              description: 'Перейти в каталог',
              featured: index < 4,
              visible: true,
              sortOrder: index
            }))
          );
          return;
        }

        setCatalogLinks([]);
        setCatalogNavigation([]);
      } catch {
        if (!cancelled) {
          setCatalogLinks([]);
          setCatalogNavigation([]);
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
