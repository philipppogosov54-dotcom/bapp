/**
 * Seed script for BeautyScore database
 * Loads test products from full_products_example.json
 */

import { PrismaClient, ProductCategory } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Map category path to ProductCategory enum
function mapCategory(categoryPath: string): ProductCategory {
  const lower = categoryPath.toLowerCase()
  
  if (lower.includes('уход для лица') || lower.includes('уход > уход для лица')) {
    return ProductCategory.SKINCARE
  }
  if (lower.includes('волос') || lower.includes('haircare')) {
    return ProductCategory.HAIRCARE
  }
  if (lower.includes('макияж') || lower.includes('makeup') || lower.includes('тональн')) {
    return ProductCategory.MAKEUP
  }
  if (lower.includes('тело') || lower.includes('body')) {
    return ProductCategory.BODY
  }
  if (lower.includes('солнц') || lower.includes('spf') || lower.includes('sun')) {
    return ProductCategory.SUNCARE
  }
  if (lower.includes('парфюм') || lower.includes('fragrance') || lower.includes('аромат')) {
    return ProductCategory.FRAGRANCE
  }
  
  return ProductCategory.OTHER
}

// Parse INCI string to ingredients array
function parseInci(inci: string | null): string[] {
  if (!inci) return []
  
  return inci
    .split(',')
    .map(i => i.trim())
    .filter(i => i.length > 0)
}

interface GoldAppleProduct {
  item_id: string
  url: string
  name: string
  brand: string
  brand_url: string
  product_type: string
  category: string
  is_adult: boolean
  in_stock: boolean
  description: string
  how_to_use: string
  inci: string
  brand_description: string
  additional_info: string
  attributes_json: Record<string, string>
  attr_product_type: string | null
  attr_gender: string | null
  attr_purpose: string | null
  attr_skin_type: string | null
  attr_area: string | null
  attr_volume: string | null
  attr_texture: string | null
  attr_finish: string | null
  country: string
  price_regular: number
  price_discount: number
  discount_percent: number
  image_url: string
  image_count: number
  parsed_at: string
}

async function main() {
  console.log('🌱 Starting seed...')
  
  // Load test products (90 products from derma/tricho collection)
  const productsFile = process.env.PRODUCTS_FILE || 'products_derma_tricho.json'
  const productsPath = path.join(__dirname, '../../../../', productsFile)
  
  if (!fs.existsSync(productsPath)) {
    console.error(`❌ ${productsFile} not found at:`, productsPath)
    process.exit(1)
  }
  
  const rawData = fs.readFileSync(productsPath, 'utf-8')
  const products: GoldAppleProduct[] = JSON.parse(rawData)
  
  console.log(`📦 Found ${products.length} products to seed`)
  
  for (const product of products) {
    const data = {
      itemId: product.item_id,
      url: product.url,
      name: product.name,
      brand: product.brand,
      brandUrl: product.brand_url,
      productType: product.product_type,
      category: mapCategory(product.category),
      categoryPath: product.category,
      description: product.description,
      howToUse: product.how_to_use,
      inci: product.inci,
      ingredients: parseInci(product.inci),
      attributes: product.attributes_json,
      skinType: product.attr_skin_type,
      purpose: product.attr_purpose,
      area: product.attr_area,
      volume: product.attr_volume,
      texture: product.attr_texture,
      finish: product.attr_finish,
      gender: product.attr_gender,
      country: product.country,
      priceRegular: product.price_regular,
      priceDiscount: product.price_discount,
      discountPercent: product.discount_percent,
      imageUrl: product.image_url,
      imageCount: product.image_count,
      inStock: product.in_stock,
      isAdult: product.is_adult,
      brandDescription: product.brand_description,
      parsedAt: new Date(product.parsed_at),
    }
    
    // Upsert to avoid duplicates
    await prisma.product.upsert({
      where: { itemId: product.item_id },
      update: data,
      create: data,
    })
    
    console.log(`✅ Seeded: ${product.brand} - ${product.name}`)
  }
  
  // Seed some sample ingredients
  console.log('\n🧪 Seeding sample ingredients...')
  
  const sampleIngredients = [
    {
      nameRu: 'Гиалуроновая кислота',
      nameEn: 'Hyaluronic Acid',
      nameInci: 'SODIUM HYALURONATE',
      aliases: ['гиалуронат натрия', 'hyaluronan'],
      safetyRating: 'SAFE' as const,
      ewgScore: 1,
      category: 'MOISTURIZER' as const,
      functions: ['увлажнение', 'anti-aging'],
      concerns: [],
      goodFor: ['DRY' as const, 'NORMAL' as const, 'COMBINATION' as const],
      badFor: [],
      description: 'Мощный увлажняющий компонент, способный удерживать воду в 1000 раз больше собственного веса.',
    },
    {
      nameRu: 'Ниацинамид',
      nameEn: 'Niacinamide',
      nameInci: 'NIACINAMIDE',
      aliases: ['никотинамид', 'витамин B3', 'vitamin B3'],
      safetyRating: 'SAFE' as const,
      ewgScore: 1,
      category: 'ACTIVE' as const,
      functions: ['выравнивание тона', 'сужение пор', 'контроль себума'],
      concerns: [],
      goodFor: ['OILY' as const, 'COMBINATION' as const, 'NORMAL' as const],
      badFor: [],
      description: 'Универсальный активный ингредиент, помогающий с пигментацией, порами и текстурой кожи.',
    },
    {
      nameRu: 'Ретинол',
      nameEn: 'Retinol',
      nameInci: 'RETINOL',
      aliases: ['витамин A', 'vitamin A'],
      safetyRating: 'GENERALLY_SAFE' as const,
      ewgScore: 3,
      category: 'ACTIVE' as const,
      functions: ['anti-aging', 'обновление клеток', 'разглаживание морщин'],
      concerns: ['может вызвать раздражение', 'фотосенсибилизация'],
      goodFor: ['NORMAL' as const, 'OILY' as const],
      badFor: ['SENSITIVE' as const],
      incompatibleWith: ['витамин C в высокой концентрации', 'AHA/BHA кислоты'],
      description: 'Золотой стандарт anti-aging. Стимулирует обновление клеток и выработку коллагена.',
    },
    {
      nameRu: 'Парфюмерная композиция',
      nameEn: 'Parfum',
      nameInci: 'PARFUM',
      aliases: ['fragrance', 'отдушка'],
      safetyRating: 'MODERATE_CONCERN' as const,
      ewgScore: 8,
      category: 'FRAGRANCE' as const,
      functions: ['ароматизация'],
      concerns: ['потенциальный аллерген', 'может раздражать чувствительную кожу'],
      goodFor: [],
      badFor: ['SENSITIVE' as const],
      description: 'Смесь ароматических веществ. Состав обычно не раскрывается производителем.',
    },
  ]
  
  for (const ingredient of sampleIngredients) {
    await prisma.ingredient.upsert({
      where: { nameInci: ingredient.nameInci },
      update: ingredient,
      create: ingredient,
    })
    console.log(`✅ Seeded ingredient: ${ingredient.nameRu}`)
  }
  
  // Create test user for E2E tests
  console.log('\n👤 Creating test user...')
  
  const hashedPassword = await bcrypt.hash('test123456', 10)
  
  await prisma.user.upsert({
    where: { email: 'test@beautyscore.ru' },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: 'test@beautyscore.ru',
      passwordHash: hashedPassword,
      name: 'Test User',
      emailVerified: new Date(),
      onboardingCompleted: true,
    },
  })
  console.log('✅ Test user created: test@beautyscore.ru / test123456')
  
  console.log('\n🎉 Seed completed successfully!')
  
  // Print stats
  const productCount = await prisma.product.count()
  const ingredientCount = await prisma.ingredient.count()
  const userCount = await prisma.user.count()
  
  console.log(`\n📊 Database stats:`)
  console.log(`   Products: ${productCount}`)
  console.log(`   Ingredients: ${ingredientCount}`)
  console.log(`   Users: ${userCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
