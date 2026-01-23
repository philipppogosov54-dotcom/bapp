/**
 * Dermatology Survey Questions (6 questions)
 * Unlocks personalized skin product recommendations
 */

import { SurveyQuestion } from './basic';

export const dermatologyQuestions: SurveyQuestion[] = [
  {
    id: 'skin_sensitivity',
    question: 'Насколько чувствительна ваша кожа?',
    type: 'single',
    options: [
      { value: 'not_sensitive', label: 'Не чувствительная', description: 'Редко реагирует на новые средства' },
      { value: 'slightly_sensitive', label: 'Слегка чувствительная', description: 'Иногда бывает раздражение' },
      { value: 'moderately_sensitive', label: 'Умеренно чувствительная', description: 'Часто реагирует на средства' },
      { value: 'very_sensitive', label: 'Очень чувствительная', description: 'Реагирует практически на всё' },
    ],
    required: true,
  },
  {
    id: 'allergies',
    question: 'Есть ли у вас аллергия на ингредиенты?',
    description: 'Выберите все известные вам аллергены',
    type: 'multiple',
    options: [
      { value: 'fragrance', label: 'Отдушки (fragrance)' },
      { value: 'alcohol', label: 'Спирт (alcohol)' },
      { value: 'parabens', label: 'Парабены (parabens)' },
      { value: 'sulfates', label: 'Сульфаты (SLS/SLES)' },
      { value: 'essential_oils', label: 'Эфирные масла' },
      { value: 'retinol', label: 'Ретинол' },
      { value: 'aha_bha', label: 'AHA/BHA кислоты' },
      { value: 'vitamin_c', label: 'Витамин C' },
      { value: 'niacinamide', label: 'Ниацинамид' },
      { value: 'other', label: 'Другое (укажите в комментарии)' },
      { value: 'none', label: 'Аллергий нет' },
    ],
    required: true,
  },
  {
    id: 'skin_conditions',
    question: 'Есть ли у вас диагностированные заболевания кожи?',
    type: 'multiple',
    options: [
      { value: 'acne_vulgaris', label: 'Акне' },
      { value: 'rosacea', label: 'Розацеа' },
      { value: 'eczema', label: 'Экзема / дерматит' },
      { value: 'psoriasis', label: 'Псориаз' },
      { value: 'seborrhea', label: 'Себорея' },
      { value: 'melasma', label: 'Мелазма' },
      { value: 'keratosis', label: 'Кератоз' },
      { value: 'none', label: 'Нет заболеваний' },
    ],
    required: true,
  },
  {
    id: 'active_ingredients',
    question: 'Какие активные ингредиенты вы уже используете?',
    description: 'Это поможет избежать конфликтов в уходе',
    type: 'multiple',
    options: [
      { value: 'retinol', label: 'Ретинол / ретиноиды' },
      { value: 'vitamin_c', label: 'Витамин C' },
      { value: 'niacinamide', label: 'Ниацинамид' },
      { value: 'hyaluronic_acid', label: 'Гиалуроновая кислота' },
      { value: 'aha', label: 'AHA кислоты (гликолевая, молочная)' },
      { value: 'bha', label: 'BHA кислоты (салициловая)' },
      { value: 'benzoyl_peroxide', label: 'Бензоилпероксид' },
      { value: 'azelaic_acid', label: 'Азелаиновая кислота' },
      { value: 'peptides', label: 'Пептиды' },
      { value: 'ceramides', label: 'Церамиды' },
      { value: 'none', label: 'Не использую активы' },
    ],
    required: true,
  },
  {
    id: 'sun_reaction',
    question: 'Как ваша кожа реагирует на солнце?',
    type: 'single',
    options: [
      { value: 'always_burn', label: 'Всегда обгораю, никогда не загораю' },
      { value: 'usually_burn', label: 'Обычно обгораю, иногда слегка загораю' },
      { value: 'sometimes_burn', label: 'Иногда обгораю, потом загораю' },
      { value: 'rarely_burn', label: 'Редко обгораю, легко загораю' },
      { value: 'never_burn', label: 'Никогда не обгораю, всегда загораю' },
    ],
    required: true,
  },
  {
    id: 'dermatologist_visit',
    question: 'Когда вы последний раз были у дерматолога?',
    type: 'single',
    options: [
      { value: 'less_6_months', label: 'Менее 6 месяцев назад' },
      { value: '6_12_months', label: '6-12 месяцев назад' },
      { value: '1_2_years', label: '1-2 года назад' },
      { value: 'more_2_years', label: 'Более 2 лет назад' },
      { value: 'never', label: 'Никогда не посещал(а)' },
    ],
    required: true,
  },
];

export const DERMATOLOGY_SURVEY_VERSION = '1.0';
