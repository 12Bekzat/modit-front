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
import { fetchCategoryNavigation, fetchProductFilters, fetchProducts } from '../services/productApi';

const categoryTones = ['sun', 'mint', 'ink', 'peach', 'sand', 'berry', 'sky', 'lime'];

function HomePage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categoryCards, setCategoryCards] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadHomeData = async () => {
      try {
        const [catalogData, navigationData, filterData] = await Promise.all([
          fetchProducts({ page: 0, size: 8, sort: 'popular', inStock: true }),
          fetchCategoryNavigation().catch(() => null),
          fetchProductFilters()
        ]);

        if (cancelled) {
          return;
        }

        setProducts(catalogData.items || []);

        if (Array.isArray(navigationData) && navigationData.length > 0) {
          setCategoryCards(
            navigationData.slice(0, 8).map((item, index) => ({
              title: item.name,
              subtitle: item.description || 'Смотреть в каталоге',
              tone: categoryTones[index % categoryTones.length]
            }))
          );
          return;
        }

        if (Array.isArray(filterData.categories) && filterData.categories.length > 0) {
          setCategoryCards(
            filterData.categories.slice(0, 8).map((title, index) => ({
              title,
              subtitle: 'Смотреть в каталоге',
              tone: categoryTones[index % categoryTones.length]
            }))
          );
          return;
        }

        setCategoryCards([]);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setCategoryCards([]);
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
