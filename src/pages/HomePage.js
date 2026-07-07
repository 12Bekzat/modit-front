import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import CategoriesSection from '../components/CategoriesSection';
import PromoSection from '../components/PromoSection';
import ProductsSection from '../components/ProductsSection';
import PerksSection from '../components/PerksSection';
import BusinessBenefitsSection from '../components/BusinessBenefitsSection';
import NewsletterSection from '../components/NewsletterSection';
import { useCart } from '../context/CartContext';
import { promoCards, perks, storeStats, filterChips } from '../data/storeData';
import { buildAllowedCategoryCards } from '../data/allowedCategories';
import { fetchCategoryNavigation, fetchProducts } from '../services/productApi';

const categoryTones = ['sun', 'mint', 'ink', 'peach', 'sand', 'berry', 'sky', 'lime'];

function HomePage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categoryCards, setCategoryCards] = useState(buildAllowedCategoryCards([], categoryTones));

  useEffect(() => {
    let cancelled = false;

    const loadHomeData = async () => {
      try {
        const [catalogData, navigationData] = await Promise.all([
          fetchProducts({ page: 0, size: 8, sort: 'popular', inStock: true }),
          fetchCategoryNavigation().catch(() => null)
        ]);

        if (cancelled) {
          return;
        }

        setProducts(catalogData.items || []);
        setCategoryCards(buildAllowedCategoryCards(navigationData || [], categoryTones));
      } catch {
        if (!cancelled) {
          setProducts([]);
          setCategoryCards(buildAllowedCategoryCards([], categoryTones));
        }
      }
    };

    loadHomeData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Hero storeStats={storeStats} />
      <CategoriesSection categoryCards={categoryCards} />
      <BusinessBenefitsSection />
      <PromoSection promoCards={promoCards} />
      <ProductsSection products={products} filterChips={filterChips} onAddToCart={addItem} />
      <PerksSection perks={perks} />
      <NewsletterSection />
    </>
  );
}

export default HomePage;
