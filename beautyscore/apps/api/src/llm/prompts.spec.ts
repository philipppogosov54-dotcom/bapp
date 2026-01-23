import { generateSystemPrompt, DEFAULT_SYSTEM_PROMPT, UserProfile } from './prompts';

describe('LLM Prompts', () => {
  describe('generateSystemPrompt', () => {
    it('should generate basic prompt for empty profile', () => {
      const profile: UserProfile = {};
      const result = generateSystemPrompt(profile);

      expect(result).toContain('эксперт-консультант');
      expect(result).toContain('Профиль клиента');
      expect(result).toContain('Инструкции');
    });

    it('should include gender when provided', () => {
      const profile: UserProfile = { gender: 'FEMALE' };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('Женщина');
    });

    it('should include male gender correctly', () => {
      const profile: UserProfile = { gender: 'MALE' };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('Мужчина');
    });

    it('should include age and age-specific concerns for young users', () => {
      const profile: UserProfile = { age: 20 };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('20 лет');
      expect(result).toContain('молодая кожа');
      expect(result).toContain('акне');
    });

    it('should include age-specific concerns for 25-35 age group', () => {
      const profile: UserProfile = { age: 30 };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('30 лет');
      expect(result).toContain('профилактики возрастных');
    });

    it('should include age-specific concerns for 35-50 age group', () => {
      const profile: UserProfile = { age: 42 };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('42 лет');
      expect(result).toContain('anti-age');
      expect(result).toContain('морщин');
    });

    it('should include age-specific concerns for 50+ age group', () => {
      const profile: UserProfile = { age: 55 };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('55 лет');
      expect(result).toContain('интенсивный');
      expect(result).toContain('восстановление');
    });

    it('should include skin type with recommendations', () => {
      const profile: UserProfile = { skinType: 'DRY' };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('Сухая');
      expect(result).toContain('увлажнение');
    });

    it('should include oily skin type correctly', () => {
      const profile: UserProfile = { skinType: 'OILY' };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('Жирная');
      expect(result).toContain('себум');
      expect(result).toContain('некомедогенные');
    });

    it('should include combination skin type correctly', () => {
      const profile: UserProfile = { skinType: 'COMBINATION' };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('Комбинированная');
      expect(result).toContain('зонирование');
    });

    it('should include sensitive skin type correctly', () => {
      const profile: UserProfile = { skinType: 'SENSITIVE' };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('Чувствительная');
      expect(result).toContain('мягкие');
      expect(result).toContain('без отдушек');
    });

    it('should include skin concerns with ingredient recommendations', () => {
      const profile: UserProfile = { skinConcerns: ['ACNE', 'PIGMENTATION'] };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('акне');
      expect(result).toContain('салициловая кислота');
      expect(result).toContain('пигментация');
      expect(result).toContain('витамин C');
    });

    it('should include allergies with warning', () => {
      const profile: UserProfile = { allergies: ['FRAGRANCE', 'PARABENS'] };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('АЛЛЕРГИИ');
      expect(result).toContain('отдушки');
      expect(result).toContain('парабены');
      expect(result).toContain('ИСКЛЮЧИТЬ');
    });

    it('should not include allergies section if only NONE', () => {
      const profile: UserProfile = { allergies: ['NONE'] };
      const result = generateSystemPrompt(profile);

      expect(result).not.toContain('АЛЛЕРГИИ');
    });

    it('should include hair type', () => {
      const profile: UserProfile = { hairType: 'CURLY' };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('Кудрявые');
    });

    it('should include damaged hair type with recommendation', () => {
      const profile: UserProfile = { hairType: 'DAMAGED' };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('Поврежденные');
      expect(result).toContain('восстановление');
    });

    it('should include hair concerns', () => {
      const profile: UserProfile = { hairConcerns: ['Выпадение', 'Сухость'] };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('Выпадение');
      expect(result).toContain('Сухость');
    });

    it('should include current products for compatibility check', () => {
      const profile: UserProfile = { currentProducts: ['Ретинол', 'Витамин C'] };
      const result = generateSystemPrompt(profile);

      expect(result).toContain('Ретинол');
      expect(result).toContain('Витамин C');
      expect(result).toContain('совместимость');
    });

    it('should include disclaimer', () => {
      const profile: UserProfile = {};
      const result = generateSystemPrompt(profile);

      expect(result).toContain('ДИСКЛЕЙМЕР');
      expect(result).toContain('не даёшь медицинских');
    });

    it('should generate comprehensive prompt for full profile', () => {
      const profile: UserProfile = {
        gender: 'FEMALE',
        age: 35,
        skinType: 'COMBINATION',
        skinConcerns: ['WRINKLES', 'DULLNESS'],
        allergies: ['FRAGRANCE'],
        hairType: 'WAVY',
        hairConcerns: ['Секущиеся кончики'],
        currentProducts: ['CeraVe Крем'],
      };

      const result = generateSystemPrompt(profile);

      expect(result).toContain('Женщина');
      expect(result).toContain('35 лет');
      expect(result).toContain('Комбинированная');
      expect(result).toContain('морщины');
      expect(result).toContain('тусклость');
      expect(result).toContain('отдушки');
      expect(result).toContain('Волнистые');
      expect(result).toContain('Секущиеся кончики');
      expect(result).toContain('CeraVe');
    });
  });

  describe('DEFAULT_SYSTEM_PROMPT', () => {
    it('should indicate profile is not filled', () => {
      expect(DEFAULT_SYSTEM_PROMPT).toContain('не заполнен');
    });

    it('should recommend filling profile', () => {
      expect(DEFAULT_SYSTEM_PROMPT).toContain('пройти опросы');
    });

    it('should include disclaimer', () => {
      expect(DEFAULT_SYSTEM_PROMPT).toContain('ДИСКЛЕЙМЕР');
    });

    it('should mention general assessment', () => {
      expect(DEFAULT_SYSTEM_PROMPT).toContain('ОБЩУЮ оценку');
    });
  });
});
