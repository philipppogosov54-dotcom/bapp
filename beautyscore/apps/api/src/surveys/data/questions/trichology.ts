/**
 * Trichology Survey Questions (6 questions)
 * Unlocks personalized hair product recommendations
 */

import { SurveyQuestion } from './basic';

export const trichologyQuestions: SurveyQuestion[] = [
  {
    id: 'hair_type',
    question: 'Какой у вас тип волос?',
    type: 'single',
    options: [
      { value: 'STRAIGHT', label: 'Прямые' },
      { value: 'WAVY', label: 'Волнистые' },
      { value: 'CURLY', label: 'Кудрявые' },
      { value: 'COILY', label: 'Очень кудрявые / афро' },
    ],
    required: true,
  },
  {
    id: 'hair_texture',
    question: 'Какая текстура ваших волос?',
    type: 'single',
    options: [
      { value: 'THIN', label: 'Тонкие', description: 'Легко повреждаются, мало объёма' },
      { value: 'MEDIUM', label: 'Нормальные', description: 'Средняя толщина' },
      { value: 'THICK', label: 'Толстые', description: 'Плотные, объёмные' },
    ],
    required: true,
  },
  {
    id: 'scalp_type',
    question: 'Какой у вас тип кожи головы?',
    type: 'single',
    options: [
      { value: 'dry', label: 'Сухая', description: 'Стянутость, шелушение' },
      { value: 'oily', label: 'Жирная', description: 'Быстро становятся жирными' },
      { value: 'normal', label: 'Нормальная' },
      { value: 'sensitive', label: 'Чувствительная', description: 'Зуд, раздражение' },
    ],
    required: true,
  },
  {
    id: 'hair_problems',
    question: 'Какие проблемы с волосами вас беспокоят?',
    description: 'Выберите до 5 наиболее актуальных',
    type: 'multiple',
    options: [
      { value: 'hair_loss', label: 'Выпадение волос' },
      { value: 'dandruff', label: 'Перхоть' },
      { value: 'dryness', label: 'Сухость, ломкость' },
      { value: 'oiliness', label: 'Жирность' },
      { value: 'split_ends', label: 'Секущиеся кончики' },
      { value: 'frizz', label: 'Пушистость' },
      { value: 'no_volume', label: 'Отсутствие объёма' },
      { value: 'color_damage', label: 'Повреждения от окрашивания' },
      { value: 'heat_damage', label: 'Повреждения от термоукладки' },
      { value: 'slow_growth', label: 'Медленный рост' },
      { value: 'none', label: 'Нет особых проблем' },
    ],
    required: true,
    validation: { max: 5 },
  },
  {
    id: 'wash_frequency',
    question: 'Как часто вы моете волосы?',
    type: 'single',
    options: [
      { value: 'daily', label: 'Каждый день' },
      { value: 'every_other_day', label: 'Через день' },
      { value: '2_3_times_week', label: '2-3 раза в неделю' },
      { value: 'once_week', label: 'Раз в неделю' },
      { value: 'less_week', label: 'Реже раза в неделю' },
    ],
    required: true,
  },
  {
    id: 'hair_treatments',
    question: 'Какие процедуры вы делаете с волосами?',
    type: 'multiple',
    options: [
      { value: 'coloring', label: 'Окрашивание' },
      { value: 'bleaching', label: 'Осветление / блондирование' },
      { value: 'straightening', label: 'Выпрямление (кератин, ботокс)' },
      { value: 'perming', label: 'Завивка' },
      { value: 'heat_styling', label: 'Термоукладка (фен, утюжок, плойка)' },
      { value: 'none', label: 'Ничего из перечисленного' },
    ],
    required: true,
  },
];

export const TRICHOLOGY_SURVEY_VERSION = '1.0';
