import { db } from './index.js';
import { users, categories, transactions, budgets } from './schema.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(budgets);
    await db.delete(transactions);
    await db.delete(categories);
    await db.delete(users);
    
    // Create sample users
    console.log('Creating sample users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const [user1, user2] = await db.insert(users).values([
      {
        email: 'john@example.com',
        password: hashedPassword,
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'jane@example.com',
        password: hashedPassword,
        name: 'Jane Smith',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).returning();
    
    // Create sample categories for user1
    console.log('Creating sample categories...');
    const user1Categories = await db.insert(categories).values([
      // Income categories
      {
        name: 'Salary',
        type: 'income',
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Freelance',
        type: 'income',
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Investments',
        type: 'income',
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Expense categories
      {
        name: 'Housing',
        type: 'expense',
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Food',
        type: 'expense',
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Transportation',
        type: 'expense',
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Entertainment',
        type: 'expense',
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Utilities',
        type: 'expense',
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Healthcare',
        type: 'expense',
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).returning();
    
    // Create sample categories for user2
    const user2Categories = await db.insert(categories).values([
      // Income categories
      {
        name: 'Salary',
        type: 'income',
        userId: user2.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Side Business',
        type: 'income',
        userId: user2.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Expense categories
      {
        name: 'Rent',
        type: 'expense',
        userId: user2.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Groceries',
        type: 'expense',
        userId: user2.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Shopping',
        type: 'expense',
        userId: user2.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).returning();
    
    // Create sample transactions for user1
    console.log('Creating sample transactions...');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Helper function to create a date in the current month
    const dateInCurrentMonth = (day: number) => new Date(currentYear, currentMonth, day);
    const dateInPreviousMonth = (day: number) => new Date(currentYear, currentMonth - 1, day);
    
    // Get category IDs for user1
    const salaryCategory = user1Categories.find((c: typeof categories.$inferSelect) => c.name === 'Salary');
    const freelanceCategory = user1Categories.find((c: typeof categories.$inferSelect) => c.name === 'Freelance');
    const investmentsCategory = user1Categories.find((c: typeof categories.$inferSelect) => c.name === 'Investments');
    const housingCategory = user1Categories.find((c: typeof categories.$inferSelect) => c.name === 'Housing');
    const foodCategory = user1Categories.find((c: typeof categories.$inferSelect) => c.name === 'Food');
    const transportationCategory = user1Categories.find((c: typeof categories.$inferSelect) => c.name === 'Transportation');
    const entertainmentCategory = user1Categories.find((c: typeof categories.$inferSelect) => c.name === 'Entertainment');
    const utilitiesCategory = user1Categories.find((c: typeof categories.$inferSelect) => c.name === 'Utilities');
    const healthcareCategory = user1Categories.find((c: typeof categories.$inferSelect) => c.name === 'Healthcare');
    
    // Create transactions for current month
    await db.insert(transactions).values([
      // Income transactions
      {
        amount: String(5000),
        description: 'Monthly salary',
        date: dateInCurrentMonth(1),
        type: 'income',
        categoryId: salaryCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(800),
        description: 'Freelance project',
        date: dateInCurrentMonth(15),
        type: 'income',
        categoryId: freelanceCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(200),
        description: 'Dividend payment',
        date: dateInCurrentMonth(20),
        type: 'income',
        categoryId: investmentsCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Expense transactions
      {
        amount: String(1500),
        description: 'Rent payment',
        date: dateInCurrentMonth(5),
        type: 'expense',
        categoryId: housingCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(400),
        description: 'Grocery shopping',
        date: dateInCurrentMonth(8),
        type: 'expense',
        categoryId: foodCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(150),
        description: 'Restaurant dinner',
        date: dateInCurrentMonth(12),
        type: 'expense',
        categoryId: foodCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(120),
        description: 'Gas refill',
        date: dateInCurrentMonth(10),
        type: 'expense',
        categoryId: transportationCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(80),
        description: 'Movie night',
        date: dateInCurrentMonth(18),
        type: 'expense',
        categoryId: entertainmentCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(200),
        description: 'Electricity bill',
        date: dateInCurrentMonth(22),
        type: 'expense',
        categoryId: utilitiesCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(150),
        description: 'Doctor visit',
        date: dateInCurrentMonth(25),
        type: 'expense',
        categoryId: healthcareCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    // Create transactions for previous month
    await db.insert(transactions).values([
      // Income transactions
      {
        amount: String(5000),
        description: 'Monthly salary',
        date: dateInPreviousMonth(1),
        type: 'income',
        categoryId: salaryCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(600),
        description: 'Freelance project',
        date: dateInPreviousMonth(10),
        type: 'income',
        categoryId: freelanceCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Expense transactions
      {
        amount: String(1500),
        description: 'Rent payment',
        date: dateInPreviousMonth(5),
        type: 'expense',
        categoryId: housingCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(350),
        description: 'Grocery shopping',
        date: dateInPreviousMonth(8),
        type: 'expense',
        categoryId: foodCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(100),
        description: 'Gas refill',
        date: dateInPreviousMonth(15),
        type: 'expense',
        categoryId: transportationCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(180),
        description: 'Water and internet bills',
        date: dateInPreviousMonth(20),
        type: 'expense',
        categoryId: utilitiesCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    // Create sample budgets for user1
    console.log('Creating sample budgets...');
    await db.insert(budgets).values([
      {
        amount: String(1500),
        month: currentMonth + 1, // Current month (1-12)
        year: currentYear,
        categoryId: housingCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(600),
        month: currentMonth + 1,
        year: currentYear,
        categoryId: foodCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(200),
        month: currentMonth + 1,
        year: currentYear,
        categoryId: transportationCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(150),
        month: currentMonth + 1,
        year: currentYear,
        categoryId: entertainmentCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(250),
        month: currentMonth + 1,
        year: currentYear,
        categoryId: utilitiesCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: String(200),
        month: currentMonth + 1,
        year: currentYear,
        categoryId: healthcareCategory?.id,
        userId: user1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();