import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WishlistButton = ({ 
  productId, 
  language = 'en', 
  size = 'default',
  variant = 'outline',
  className = '',
  showText = false,
  onStatusChange = null
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const texts = {
    ar: {
      addToWishlist: 'إضافة للمفضلة',
      removeFromWishlist: 'إزالة من المفضلة',
      loginRequired: 'يجب تسجيل الدخول أولاً'
    },
    en: {
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      loginRequired: 'Please login first'
    }
  };

  const t = texts[language] || texts.en;

  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem('session_token') !== null;
  };

  useEffect(() => {
    if (productId && isLoggedIn()) {
      checkWishlistStatus();
    } else {
      setIsChecking(false);
    }
  }, [productId]);

  const checkWishlistStatus = async () => {
    try {
      setIsChecking(true);
      
      const response = await fetch(`/api/wishlist.php?action=check-wishlist-status&product_id=${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsInWishlist(data.in_wishlist);
        if (onStatusChange) {
          onStatusChange(data.in_wishlist);
        }
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const toggleWishlist = async () => {
    if (!isLoggedIn()) {
      alert(t.loginRequired);
      return;
    }

    try {
      setIsLoading(true);
      
      const action = isInWishlist ? 'remove-from-wishlist' : 'add-to-wishlist';
      const method = isInWishlist ? 'DELETE' : 'POST';
      
      let url = `/api/wishlist.php?action=${action}`;
      let options = {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        }
      };
      
      if (!isInWishlist) {
        url = `/api/wishlist.php?action=${action}`;
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify({ product_id: productId });
      } else {
        url += `&product_id=${productId}`;
      }
      
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsInWishlist(!isInWishlist);
        if (onStatusChange) {
          onStatusChange(!isInWishlist);
        }
      } else {
        console.error('Wishlist operation failed:', data.error);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn(className)}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {showText && <span className="ml-2">...</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={toggleWishlist}
      disabled={isLoading}
      title={isInWishlist ? t.removeFromWishlist : t.addToWishlist}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart 
          className={cn(
            "h-4 w-4",
            isInWishlist && "fill-current text-red-500"
          )} 
        />
      )}
      {showText && (
        <span className="ml-2">
          {isInWishlist ? t.removeFromWishlist : t.addToWishlist}
        </span>
      )}
    </Button>
  );
};

export default WishlistButton;

