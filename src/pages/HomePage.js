import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import CategoriesSection from '../components/CategoriesSection';
import PromoSection from '../components/PromoSection';
import ProductsSection from '../components/ProductsSection';
import PerksSection from '../components/PerksSection';
import BusinessBenefitsSection from '../components/BusinessBenefitsSection';
import NewsletterSection from '../components/NewsletterSection';
import { useCart } from '../context/CartContext';
import { promoCards, perks, storeStats, filterChips, featuredCategoryTiles } from '../data/storeData';
import { fetchProducts } from '../services/productApi';

function HomePage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categoryCards, setCategoryCards] = useState(featuredCategoryTiles);

  useEffect(() => {
    let cancelled = false;

    const loadHomeData = async () => {
      try {
        const catalogData = await fetchProducts({ page: 0, size: 8, sort: 'popular', inStock: true });

        if (cancelled) {
          return;
        }

        setProducts(catalogData.items || []);
        setCategoryCards(featuredCategoryTiles);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setCategoryCards(featuredCategoryTiles);
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
