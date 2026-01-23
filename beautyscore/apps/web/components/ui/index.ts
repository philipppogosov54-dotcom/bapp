// UI Components Index
// Export all reusable UI components

// Core - re-export existing components
export * from './button';
export * from './input';
export * from './avatar';
export * from './progress';

// Form
export * from './checkbox';
export * from './checkbox-group';
export * from './radio-group';

// Navigation
export { BottomNavigation } from './bottom-navigation';

// Feedback
export { ToastProvider, useToast } from './toast';
export { Modal, ConfirmModal } from './modal';

// States
export { 
  Skeleton, 
  ProductCardSkeleton, 
  ShelfItemSkeleton,
  ProductDetailSkeleton,
  NotificationSkeleton,
  SearchResultsSkeleton,
  ShelfListSkeleton,
  StatsCardsSkeleton,
} from './skeleton';
export { EmptyState } from './empty-state';
export { ErrorState } from './error-state';
export { Spinner, LoadingPage, LoadingInline, ButtonSpinner } from './spinner';

// Badges
export { Badge, StatusBadge, TagBadge } from './badge';
export { ScoreBadge, ScoreDisplay } from './score-badge';

// Disclaimers
export { Disclaimer, AIDisclaimer, PersonalizationDisclaimer, SurveyRequiredDisclaimer } from './disclaimer';

// Product
export { ProductPlaceholder, ProductImage } from './product-placeholder';

// Search
export { SearchHistory } from './search-history';
export { FiltersModal } from './filters-modal';
export type { FilterOptions } from './filters-modal';

// Shelf
export { ShelfAnalysisCard } from './shelf-analysis-card';
