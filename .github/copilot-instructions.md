# ProCheff – AI Coding Agent Guide

## 🧭 Architecture Overview
- **Frontend:** Next.js 14 + TypeScript + TailwindCSS  
  - Ana modüller: `DashboardTab`, `RecipesTab`, `PricesTab`, `PlanTab`  
  - App Router yapısı (`ProCheff/app/`) kullanılıyor.  
  - Bileşenler: `components/` altında; her bileşen sade, stateless ve tip tanımlı.  
- **Backend:** Express.js API (`ProCheff/server/`)  
  - Route proxy'leri ve rate-limiter yapısı mevcut.  
  - Google Gemini API'sine `/api-proxy` üzerinden erişim sağlanıyor.
- **AI Integration:**  
  - `GoogleGenAI` SDK kullanılarak Gemini 2.5 Flash modeliyle analiz ve fiyat tahmini üretiliyor.  
  - `utils/` klasöründe AI yardımcı fonksiyonları (`performGeminiAnalysis`, `safeCall`) mevcut.
- **Utilities & Hooks:**  
  - `useRecipes`, `useForm` custom hook'ları; `apiHelpers.ts`, `recipeUtils.ts` yardımcı fonksiyonları.  
  - `brandUtils.ts` dosyası marka/logo eşleştirmesi yapıyor.

## ⚙️ Developer Workflows
- Geliştirme:  
  ```bash
  cd ProCheff && npm run dev
  cd server && npm run dev
  ```
- Frontend port: `3000`, Backend port: `3001`  
- API endpoint'leri `/api/` prefix'i ile başlayıp backend'e proxy ediliyor.

## 🎯 Key Implementation Areas

### Frontend Components (`ProCheff/components/`)
- **Tab Components**: `DashboardTab.tsx`, `RecipesTab.tsx`, `PricesTab.tsx`, `PlanTab.tsx`  
- **Shared UI**: `Navigation.tsx`, `Footer.tsx`, `Layout.tsx`  
- **Recipe Cards**: Responsive design, image handling, rating displays  
- **Form Elements**: Controlled inputs, validation feedback, loading states

### Custom Hooks (`ProCheff/hooks/`)
- **`useRecipes.ts`**: Recipe CRUD operations, filtering, search functionality  
- **`useForm.ts`**: Form state management, validation, submission handling  
- **State Management**: React hooks pattern, avoid external state managers

### Backend API (`ProCheff/server/`)
- **Routes**: RESTful endpoints for recipes, user data, AI analysis  
- **Middleware**: CORS, rate limiting, error handling  
- **AI Proxy**: `/api-proxy/gemini` endpoint for Google Gemini integration  
- **Security**: Input validation, sanitization, environment variables

### Utils & Helpers (`ProCheff/utils/`)
- **`apiHelpers.ts`**: HTTP request wrappers, error handling  
- **`recipeUtils.ts`**: Recipe data validation, formatting functions  
- **`brandUtils.ts`**: Brand/logo matching utilities  
- **AI Utils**: Gemini API integration, safe error handling

## 🔧 Code Standards

### TypeScript Usage
- Strict type checking enabled  
- Interface definitions for all data structures  
- Generic types for reusable components  
- Proper error type handling

### Component Patterns
```typescript
// Preferred component structure
interface ComponentProps {
  data: RecipeData[];
  onAction: (id: string) => void;
}

export default function Component({ data, onAction }: ComponentProps) {
  // Component logic
  return <div>...</div>;
}
```

### API Integration
```typescript
// Preferred API call pattern
import { safeCall } from '@/utils/apiHelpers';

const result = await safeCall(async () => {
  return await fetch('/api/recipes').then(res => res.json());
});
```

### Styling Approach
- TailwindCSS utility classes preferred  
- Responsive design mobile-first  
- Dark mode support where applicable  
- Consistent spacing and color schemes

## 📱 UI/UX Guidelines

### Design System
- **Colors**: Primary brand colors, semantic colors for status  
- **Typography**: Clear hierarchy, readable font sizes  
- **Spacing**: Consistent padding/margin scale  
- **Animations**: Subtle transitions, loading states

### Responsive Design
- Mobile-first approach  
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`  
- Touch-friendly interactive elements  
- Optimized images and assets

### Accessibility
- Semantic HTML elements  
- ARIA labels where needed  
- Keyboard navigation support  
- Color contrast compliance

## 🚀 Performance Optimization

### Frontend Optimization
- Next.js Image component for optimized images  
- Dynamic imports for code splitting  
- Memoization for expensive calculations  
- Lazy loading for non-critical content

### Backend Optimization
- Efficient database queries  
- Response caching where appropriate  
- Rate limiting for API protection  
- Error logging and monitoring

## 🔐 Security Considerations

### Frontend Security
- Input sanitization and validation  
- Secure API key handling  
- XSS prevention measures  
- Content Security Policy implementation

### Backend Security
- Environment variable usage for secrets  
- Input validation and sanitization  
- Rate limiting and DDoS protection  
- Secure HTTP headers

## 🧪 Testing Strategy

### Unit Testing
- Jest for JavaScript/TypeScript testing  
- React Testing Library for component tests  
- Mock API responses for reliable tests  
- High coverage for critical business logic

### Integration Testing
- API endpoint testing  
- Frontend-backend integration tests  
- AI integration testing with mock responses  
- Error handling validation

## 📚 Development Best Practices

### Code Organization
- Clear file naming conventions  
- Logical folder structure  
- Separation of concerns  
- Reusable utility functions

### Git Workflow
- Descriptive commit messages  
- Feature branch development  
- Code review process  
- Automated testing in CI/CD

### Documentation
- JSDoc comments for complex functions  
- README files for setup instructions  
- API documentation for endpoints  
- Component usage examples

## 🎨 AI Integration Specifics

### Google Gemini Integration
- Model: `gemini-2.0-flash-exp` for analysis tasks  
- Safety settings configured for appropriate content filtering  
- Structured prompts for consistent responses  
- Error handling for API failures

### Recipe Analysis Features
- Ingredient recognition and parsing  
- Nutritional information extraction  
- Cooking time estimation  
- Difficulty level assessment  
- Price estimation based on market data

### Content Generation
- Recipe title optimization  
- Ingredient substitution suggestions  
- Cooking instruction refinement  
- SEO-friendly content generation

---

**Key Reminder**: Bu proje Türkiye kullanıcıları için tasarlandığından, yerel mutfak kültürü, malzeme isimleri ve fiyat analizlerinde Türkiye pazarı göz önünde bulundurulmalıdır.
