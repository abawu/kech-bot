import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export type PaymentMethod = "cash" | "bank_transfer" | "mobile_money";

export type OrderStatus =
  | "pending_confirmation"
  | "accepted"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface Cafe {
  id: string;
  name: string;
  takeawayFee: number;
  location: {
    latitude: number;
    longitude: number;
  };
  menu: MenuItem[];
}

export interface CartItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface BotSession {
  chatId: string;
  username?: string;
  language?: "en" | "am";
  activeBotMessageId?: number;
  selectedCafeId?: string;
  selectedCategory?: string;
  cart: CartItem[];
  contactPhone?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  paymentMethod?: PaymentMethod;
  receiptFileId?: string;
  awaitingContact?: boolean;
  awaitingLocation?: boolean;
  awaitingReceipt?: boolean;
}

export interface Order {
  id: string;
  customerChatId: string;
  customerUsername?: string;
  language?: "en" | "am";
  customerPhone: string;
  cafeId: string;
  cafeName: string;
  items: CartItem[];
  takeawayFee: number;
  deliveryDistanceKm: number;
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  receiptFileId?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: OrderStatus;
  createdAt: Date;
}

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listCafes(): Promise<Cafe[]>;
  getCafe(id: string): Promise<Cafe | undefined>;
  getSession(chatId: string): Promise<BotSession>;
  saveSession(session: BotSession): Promise<BotSession>;
  clearSession(chatId: string): Promise<void>;
  createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined>;
  listOrdersForCustomer(chatId: string): Promise<Order[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, BotSession>;
  private orders: Map<string, Order>;
  private cafes: Cafe[];

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.orders = new Map();
    this.cafes = [
      {
        id: "chanolly-noodle",
        name: "Chanolly Noodle",
        takeawayFee: 55,
        location: {
          latitude: 7.047273,
          longitude: 38.4784547,
        },
        menu: [
          { id: "egg-noodle-soup", name: "Egg Noodle Soup", price: 450 },
          { id: "hot-and-sour-soup", name: "Hot & Sour Soup", price: 420 },
          { id: "chicken-noodle-soup", name: "Chicken Noodle Soup", price: 560 },
          { id: "normal-salad-half", name: "Normal Salad (Half)", price: 550 },
          { id: "normal-salad-full", name: "Normal Salad (Full)", price: 730 },
          { id: "fish-salad-half", name: "Fish Salad (Half)", price: 600 },
          { id: "fish-salad-full", name: "Fish Salad (Full)", price: 780 },
          { id: "beef-salad-half", name: "Beef Salad (Half)", price: 650 },
          { id: "beef-salad-full", name: "Beef Salad (Full)", price: 830 },
          { id: "chicken-salad-half", name: "Chicken Salad (Half)", price: 700 },
          { id: "chicken-salad-full", name: "Chicken Salad (Full)", price: 850 },
          { id: "combo-salad-half", name: "Combo Salad (Half)", price: 720 },
          { id: "combo-salad-full", name: "Combo Salad (Full)", price: 870 },
          { id: "stir-fry-vegetable-noodle", name: "Stir Fry Vegetable Noodle", price: 690 },
          { id: "stir-fry-egg-noodle", name: "Stir Fry Egg Noodle", price: 750 },
          { id: "stir-fry-chicken-noodle", name: "Stir Fry Chicken Noodle", price: 850 },
          { id: "stir-fry-beef-noodle", name: "Stir Fry Beef Noodle", price: 890 },
          { id: "stir-fry-combo-noodle", name: "Stir Fry Combo Noodle", price: 950 },
          { id: "vegetable-fried-rice", name: "Vegetable Fried Rice", price: 650 },
          { id: "fish-fried-rice", name: "Fish Fried Rice", price: 690 },
          { id: "beef-fried-rice", name: "Beef Fried Rice", price: 750 },
          { id: "chicken-fried-rice", name: "Chicken Fried Rice", price: 770 },
          { id: "combo-rice", name: "Combo Rice", price: 760 },
          { id: "chicken-sizzling", name: "Chicken Sizzling", price: 1200 },
          { id: "beef-sizzling", name: "Beef Sizzling", price: 1120 },
          { id: "fish-sizzling", name: "Fish Sizzling", price: 890 },
          { id: "chicken-lollipop", name: "Chicken Lollipop", price: 1150 },
          { id: "broccoli-garlic", name: "Broccoli Garlic", price: 520 },
          { id: "baby-corn", name: "Baby Corn", price: 600 },
          { id: "fried-tofu", name: "Fried Tofu", price: 650 },
          { id: "peanut-chicken", name: "Peanut Chicken", price: 1290 },
          { id: "beef-broccoli", name: "Beef Broccoli", price: 950 },
          { id: "sweet-and-sour-chicken", name: "Sweet and Sour Chicken", price: 1140 },
          { id: "fried-corn-with-chicken", name: "Fried Corn with Chicken", price: 750 },
          { id: "easy-sauteed-spinach-broccoli", name: "Easy Sauteed Spinach with Broccoli", price: 690 },
          { id: "mixed-vegetable", name: "Mixed Vegetable", price: 570 },
          { id: "classic-mojito-small", name: "Classic Mojito (Small)", price: 250 },
          { id: "classic-mojito-large", name: "Classic Mojito (Large)", price: 500 },
          { id: "strawberry-mojito-small", name: "Strawberry Mojito (Small)", price: 250 },
          { id: "strawberry-mojito-large", name: "Strawberry Mojito (Large)", price: 500 },
          { id: "pineapple-mojito-small", name: "Pineapple Mojito (Small)", price: 250 },
          { id: "pineapple-mojito-large", name: "Pineapple Mojito (Large)", price: 500 },
          { id: "blue-lagoon-mojito-small", name: "Blue Lagoon Mojito (Small)", price: 250 },
          { id: "blue-lagoon-mojito-large", name: "Blue Lagoon Mojito (Large)", price: 500 },
          { id: "espresso-mojito-rum-small", name: "Espresso Mojito with Rum (Small)", price: 250 },
          { id: "espresso-mojito-rum-large", name: "Espresso Mojito with Rum (Large)", price: 500 },
          { id: "cinnamon-mojito-rum-small", name: "Cinnamon Mojito with Rum (Small)", price: 250 },
          { id: "cinnamon-mojito-rum-large", name: "Cinnamon Mojito with Rum (Large)", price: 500 },
          { id: "special-mojito-fresh-fruit", name: "Special Mojito (Fresh Fruit)", price: 420 },
          { id: "double-mojito-rum-small", name: "Double Mojito with Rum (Small)", price: 270 },
          { id: "double-mojito-rum-large", name: "Double Mojito with Rum (Large)", price: 520 },
          { id: "chandy-best-smoothie", name: "Chandy Best Smoothie", price: 300 },
          { id: "avocado-banana-smoothie", name: "Avocado Banana Smoothie", price: 300 },
          { id: "banana-smoothie", name: "Banana Smoothie", price: 300 },
          { id: "strawberry-smoothie", name: "Strawberry Smoothie", price: 300 },
          { id: "classic-peanut-butter-smoothie", name: "Classic Peanut Butter Smoothie", price: 300 },
          { id: "peanut-milk-banana-smoothie", name: "Peanut Milk Banana Smoothie", price: 300 },
          { id: "butter-milk-banana-smoothie", name: "Butter Milk Banana Smoothie", price: 300 },
          { id: "green-smoothie", name: "Green Smoothie", price: 300 },
          { id: "avocado-espresso-smoothie", name: "Avocado Espresso Smoothie", price: 300 },
          { id: "extra-egg", name: "Extra Egg", price: 50 },
          { id: "extra-fish", name: "Extra Fish", price: 150 },
          { id: "extra-chicken", name: "Extra Chicken", price: 200 },
          { id: "extra-sauce", name: "Extra Sauce", price: 50 },
          { id: "extra-rice", name: "Extra Rice", price: 250 },
          { id: "extra-vegetable", name: "Extra Vegetable", price: 200 },
          { id: "extra-tea-cup", name: "Extra Tea Cup", price: 40 },
          { id: "extra-rum-gin", name: "Extra Rum (Gin)", price: 250 },
          { id: "water-small", name: "Water (Small)", price: 25 },
          { id: "water-large", name: "Water (Large)", price: 50 },
          { id: "size-option-small", name: "Size Option (Small)", price: 450 },
          { id: "size-option-medium", name: "Size Option (Medium)", price: 550 },
          { id: "size-option-large", name: "Size Option (Large)", price: 650 },
        ],
      },
      {
        id: "htown-cafe",
        name: "H-Town Burger",
        takeawayFee: 50,
        location: {
          latitude: 7.0397553,
          longitude: 38.4828616,
        },
        menu: [
          { id: "town-burger", name: "Town Burger", price: 550 },
          { id: "double-smash", name: "Double Smash", price: 600 },
          { id: "chef-burger", name: "Chef Burger", price: 500 },
          { id: "chicken-burger", name: "Chicken Burger", price: 450 },
          { id: "cheese-burger", name: "Cheese Burger", price: 500 },
          { id: "fasting-burger", name: "Fasting Burger", price: 400 },
          { id: "bbq-burger", name: "BBQ Burger", price: 600 },
          { id: "special-pizza", name: "Special Pizza", price: 600 },
          { id: "chicken-pizza", name: "Chicken Pizza", price: 650 },
          { id: "beef-pizza", name: "Beef Pizza", price: 450 },
          { id: "margarita-pizza", name: "Margarita Pizza", price: 400 },
          { id: "cabazon-pizza", name: "Cabazon Pizza", price: 600 },
          { id: "vegetable-pizza", name: "Vegetable Pizza", price: 400 },
          { id: "tuna-cheese-pizza", name: "Tuna with Cheese Pizza", price: 650 },
          { id: "tuna-vegetable-pizza", name: "Tuna with Vegetable Pizza", price: 550 },
          { id: "chicken-shawarma", name: "Chicken Shawarma", price: 650 },
          { id: "beef-shawarma", name: "Beef Shawarma", price: 550 },
          { id: "vegetable-shawarma", name: "Vegetable Shawarma", price: 400 },
          { id: "chicken-roll", name: "Chicken Roll", price: 300 },
          { id: "beef-roll", name: "Beef Roll", price: 300 },
          { id: "vegetable-roll", name: "Vegetable Roll", price: 200 },
          { id: "beef-stear", name: "Beef Stear", price: 550 },
          { id: "chicken-steam", name: "Chicken Steam", price: 650 },
          { id: "special-juice", name: "Special Juice", price: 170 },
          { id: "avocado-juice", name: "Avocado Juice", price: 150 },
          { id: "papaya-juice", name: "Papaya Juice", price: 150 },
          { id: "banana-juice", name: "Banana Juice", price: 150 },
          { id: "strawberry-shake", name: "Strawberry Shake", price: 200 },
          { id: "chocolate-drink", name: "Chocolate Drink", price: 220 },
          { id: "club-sandwich", name: "Club Sandwich", price: 550 },
          { id: "tuna-club", name: "Tuna Club", price: 600 },
          { id: "egg-sandwich", name: "Egg Sandwich", price: 300 },
          { id: "special-egg-sandwich", name: "Special Egg Sandwich", price: 300 },
          { id: "vegetable-sandwich", name: "Vegetable Sandwich", price: 200 },
          { id: "beef-fajita", name: "Beef Fajita", price: 600 },
          { id: "chicken-fajita", name: "Chicken Fajita", price: 650 },
          { id: "beef-chafan", name: "Beef Chafan", price: 450 },
          { id: "chicken-chafan", name: "Chicken Chafan", price: 500 },
          { id: "ceg-chafan", name: "Ceg Chafan", price: 400 },
          { id: "french-fried", name: "French Fried", price: 300 },
          { id: "loaded-french-fried", name: "Loaded French Fried", price: 450 },
          { id: "chicken-loaded", name: "Chicken Loaded", price: 500 },
          { id: "special-french-fried", name: "Special French Fried", price: 350 },
          { id: "waffle", name: "Waffle", price: 300 },
          { id: "omlet", name: "Omlet", price: 200 },
          { id: "special-omlet", name: "Special Omlet", price: 300 },
          { id: "foul", name: "Foul", price: 300 },
          { id: "chechebsa", name: "Chechebsa", price: 250 },
          { id: "special-chechebsa", name: "Special Chechebsa", price: 300 },
          { id: "special-fetira", name: "Special Fetira", price: 350 },
          { id: "chicken-borito", name: "Chicken Borito", price: 650 },
          { id: "beef-borito", name: "Beef Borito", price: 550 },
          { id: "fasting-borito", name: "Fasting Borito", price: 450 },
          { id: "water", name: "Water", price: 40 },
          { id: "soft-drink", name: "Soft Drink", price: 70 },
          { id: "takeaway-foil", name: "Takeaway Foil", price: 50 },
          { id: "takeaway-box", name: "Takeaway Box", price: 70 },
          { id: "extra-cheese", name: "Extra Cheese", price: 70 },
          { id: "extra-mayo-ketchup", name: "Extra Mayo & Ketchup", price: 50 },
        ],
      },
      {
        id: "safeland-cafe",
        name: "Safeland Cafe",
        takeawayFee: 50,
        location: {
          latitude: 7.0497648,
          longitude: 38.4752034,
        },
        menu: [
          { id: "avocado-toast", name: "Avocado Toast", price: 300 },
          { id: "pancake", name: "Pancake", price: 300 },
          { id: "omelet", name: "Omelet", price: 250 },
          { id: "special-omelet", name: "Special Omelet", price: 350 },
          { id: "egg-with-meat", name: "Egg with Meat", price: 350 },
          { id: "fried-egg", name: "Fried Egg", price: 250 },
          { id: "fried-egg-large", name: "Fried Egg Special", price: 280 },
          { id: "chechebsa", name: "Chechebsa", price: 250 },
          { id: "special-chechebsa", name: "Special Chechebsa", price: 290 },
          { id: "fetira", name: "Fetira", price: 250 },
          { id: "special-fetira", name: "Special Fetira", price: 290 },
          { id: "injera-firfir", name: "Injera Firfir", price: 250 },
          { id: "quanta-firfir", name: "Quanta Firfir", price: 450 },
          { id: "chekena-tibes", name: "Chekena Tibes", price: 500 },
          { id: "special-tibes", name: "Special Tibes", price: 600 },
          { id: "tibes-teferesho", name: "Tibes Teferesho", price: 400 },
          { id: "tibes-firfir", name: "Tibes Firfir", price: 450 },
          { id: "pasta-tomato-sauce", name: "Pasta with Tomato Sauce", price: 250 },
          { id: "pasta-bolognese", name: "Pasta with Bolognese Sauce", price: 350 },
          { id: "pasta-vegetable", name: "Pasta with Vegetable", price: 200 },
          { id: "pasta-tuna", name: "Pasta with Tuna", price: 400 },
          { id: "pasta-egg", name: "Pasta with Egg", price: 250 },
          { id: "pasta-fish", name: "Pasta with Fish", price: 350 },
          { id: "fish-gulash", name: "Fish Gulash", price: 550 },
          { id: "fish-cotelet", name: "Fish Cotelet", price: 600 },
          { id: "fish-leb-leb", name: "Fish Leb Leb", price: 400 },
          { id: "chicken-wing", name: "Chicken Wing", price: 650 },
          { id: "fried-chicken", name: "Fried Chicken", price: 690 },
          { id: "chicken-fajita", name: "Chicken Fajita", price: 580 },
          { id: "beef-fajita", name: "Beef Fajita", price: 570 },
          { id: "fish-fajita", name: "Fish Fajita", price: 560 },
          { id: "chicken-shawarma", name: "Chicken Shawarma", price: 580 },
          { id: "beef-shawarma", name: "Beef Shawarma", price: 550 },
          { id: "special-shawarma", name: "Special Shawarma", price: 650 },
          { id: "vegetable-shawarma", name: "Vegetable Shawarma", price: 450 },
          { id: "salad", name: "Salad", price: 350 },
          { id: "tuna-salad", name: "Tuna Salad", price: 440 },
          { id: "beef-with-salad", name: "Beef with Salad", price: 450 },
          { id: "mixed-fruit-salad", name: "Mixed Fruit Salad", price: 380 },
          { id: "chicken-salad", name: "Chicken Salad", price: 480 },
          { id: "special-club-sandwich", name: "Special Club Sandwich", price: 600 },
          { id: "tuna-club-sandwich", name: "Tuna Club Sandwich", price: 500 },
          { id: "egg-sandwich", name: "Egg Sandwich", price: 250 },
          { id: "vegetable-sandwich", name: "Vegetable Sandwich", price: 250 },
          { id: "fish-sandwich", name: "Fish Sandwich", price: 400 },
          { id: "tuna-sandwich", name: "Tuna Sandwich", price: 400 },
          { id: "french-fries", name: "French Fries", price: 280 },
          { id: "special-french-fries", name: "Special French Fries", price: 380 },
          { id: "juicy-king-burger", name: "Juicy King Burger", price: 680 },
          { id: "beef-burger", name: "Beef Burger", price: 410 },
          { id: "cheese-burger", name: "Cheese Burger", price: 450 },
          { id: "special-burger", name: "Special Burger", price: 490 },
          { id: "chicken-burger", name: "Chicken Burger", price: 550 },
          { id: "double-chicken-burger", name: "Double Chicken Burger", price: 650 },
          { id: "bbq-burger", name: "BBQ Burger", price: 500 },
          { id: "fasting-burger", name: "Fasting Burger", price: 380 },
          { id: "king-burger", name: "King Burger", price: 570 },
          { id: "london-bus-juicy-burger", name: "London Bus Juicy Burger", price: 1150 },
          { id: "margarita-pizza", name: "Margarita Pizza", price: 500 },
          { id: "fasting-vegetable-pizza", name: "Pizza with Vegetable Fasting", price: 400 },
          { id: "vegetable-cheese-pizza", name: "Vegetable with Cheese Pizza", price: 530 },
          { id: "pizza-with-tuna", name: "Pizza with Tuna", price: 550 },
          { id: "tuna-cheese-pizza", name: "Tuna Cheese Pizza", price: 580 },
          { id: "pizza-with-chicken", name: "Pizza with Chicken", price: 610 },
          { id: "beef-pizza", name: "Beef Pizza", price: 570 },
          { id: "safeland-special-pizza", name: "Safeland Special Pizza", price: 630 },
          { id: "burgerizza", name: "Burgerizza", price: 700 },
          { id: "chicken-burrito", name: "Chicken Burrito", price: 650 },
          { id: "beef-burrito", name: "Beef Burrito", price: 580 },
          { id: "safeland-burrito", name: "Safeland Burrito", price: 730 },
          { id: "chicken-wrap", name: "Chicken Wrap", price: 550 },
          { id: "beef-wrap", name: "Beef Wrap", price: 520 },
          { id: "safeland-tacos", name: "Safeland Tacos", price: 550 },
          { id: "chicken-tacos", name: "Chicken Tacos", price: 530 },
          { id: "beef-tacos", name: "Beef Tacos", price: 500 },
          { id: "tuna-tacos", name: "Tuna Tacos", price: 450 },
          { id: "fasting-tacos", name: "Fasting Tacos", price: 400 },
        ],
      },
      {
        id: "mountain-cafe",
        name: "Mountain Cafe",
        takeawayFee: 60,
        location: {
          latitude: 7.041403,
          longitude: 38.48027,
        },
        menu: [
          { id: "mountain-special-burger", name: "Mountain Special Burger", price: 550 },
          { id: "beef-burger", name: "Beef Burger", price: 410 },
          { id: "chicken-burger", name: "Chicken Burger", price: 510 },
          { id: "cheese-burger", name: "Cheese Burger", price: 430 },
          { id: "juicy-burger", name: "Juicy Burger", price: 490 },
          { id: "barbeque-burger", name: "Barbeque Burger", price: 480 },
          { id: "double-cheese-burger", name: "Double Cheese Burger", price: 560 },
          { id: "chicken-beef-burger", name: "Chicken & Beef Burger", price: 570 },
          { id: "king-juicy-burger", name: "King Juicy Burger", price: 570 },
          { id: "mini-burger-kids", name: "Mini Burger (Kids)", price: 360 },
          { id: "mountain-special-pizza", name: "Mountain Special Pizza", price: 630 },
          { id: "beef-pizza", name: "Beef Pizza", price: 600 },
          { id: "chicken-pizza", name: "Chicken Pizza", price: 610 },
          { id: "margarita-pizza", name: "Margarita Pizza", price: 450 },
          { id: "al-tuna-pizza", name: "Al-Tuna Pizza", price: 550 },
          { id: "fasting-tuna-pizza", name: "Fasting Tuna Pizza", price: 510 },
          { id: "vegetable-pizza", name: "Vegetable Pizza", price: 380 },
          { id: "family-pizza", name: "Family Pizza", price: 990 },
          { id: "beef-loaded-fries", name: "Beef Loaded Fries", price: 420 },
          { id: "chicken-loaded-fries", name: "Chicken Loaded Fries", price: 440 },
          { id: "mini-pizza-special", name: "Mini Pizza Special", price: 350 },
          { id: "mini-pizza-beef", name: "Mini Pizza Beef", price: 310 },
          { id: "mini-pizza-margarita", name: "Mini Pizza Margarita", price: 250 },
          { id: "mini-pizza-tuna", name: "Mini Pizza Tuna", price: 310 },
          { id: "mini-pizza-al-tuna", name: "Mini Pizza Al-Tuna", price: 340 },
          { id: "mini-pizza-vegetable", name: "Mini Pizza Vegetable", price: 270 },
          { id: "chefs-special-sandwich", name: "Chef's Special Sandwich", price: 590 },
          { id: "club-sandwich", name: "Club Sandwich", price: 550 },
          { id: "half-club-sandwich", name: "Half-Club Sandwich", price: 410 },
          { id: "tuna-sandwich", name: "Tuna Sandwich", price: 410 },
          { id: "vegetable-sandwich", name: "Vegetable Sandwich", price: 320 },
          { id: "egg-sandwich", name: "Egg Sandwich", price: 210 },
          { id: "special-shawarma", name: "Special Shawarma", price: 620 },
          { id: "beef-shawarma", name: "Beef Shawarma", price: 580 },
          { id: "chicken-shawarma", name: "Chicken Shawarma", price: 590 },
          { id: "vegetable-shawarma", name: "Vegetable Shawarma", price: 420 },
          { id: "tuna-shawarma", name: "Tuna Shawarma", price: 540 },
          { id: "chefs-salad-beef", name: "Chef's Salad with Beef", price: 450 },
          { id: "chefs-salad-chicken", name: "Chef's Salad with Chicken", price: 460 },
          { id: "chefs-salad-tuna", name: "Chef's Salad with Tuna", price: 440 },
          { id: "mixed-fasting-salad", name: "Mixed Fasting Salad", price: 310 },
          { id: "tuna-salad", name: "Tuna Salad", price: 400 },
          { id: "chicken-tenders", name: "Chicken Tenders", price: 690 },
          { id: "crispy-chicken-3pcs", name: "Crispy Chicken (3 Pcs)", price: 610 },
          { id: "crispy-chicken-4pcs", name: "Crispy Chicken (4 Pcs)", price: 730 },
          { id: "fried-chicken-2pcs", name: "Fried Chicken (2 Pcs)", price: 580 },
          { id: "fried-chicken-3pcs", name: "Fried Chicken (3 Pcs)", price: 710 },
          { id: "crispy-chicken-wrap", name: "Crispy Chicken Wrap", price: 650 },
          { id: "chicken-wing", name: "Chicken Wing", price: 660 },
          { id: "chicken-burrito", name: "Chicken Burrito", price: 640 },
          { id: "beef-burrito", name: "Beef Burrito", price: 610 },
          { id: "tuna-burrito", name: "Tuna Burrito", price: 600 },
          { id: "chicken-fajita", name: "Chicken Fajita", price: 580 },
          { id: "beef-fajita", name: "Beef Fajita", price: 570 },
          { id: "beef-roll", name: "Beef Roll", price: 420 },
          { id: "vegetable-roll", name: "Vegetable Roll", price: 380 },
          { id: "french-fries", name: "French Fries", price: 180 },
          { id: "chips-masala", name: "Chips Masala", price: 170 },
          { id: "fish-cutlet", name: "Fish Cutlet", price: 490 },
          { id: "fish-goulash", name: "Fish Goulash", price: 510 },
          { id: "fish-n-chips", name: "Fish N Chips", price: 480 },
        ],
      },
      {
        id: "liyu-taim-migib-bet",
        name: "Liyu Taim Restaurant",
        takeawayFee: 30,
        location: {
          latitude: 7.0366261,
          longitude: 38.4871992,
        },
        menu: [
          { id: "scrambled-eggs-enkulal-firfir", name: "Scrambled Eggs (Enkulal Firfir)", price: 150 },
          { id: "injera-firfir-breakfast", name: "Injera Firfir", price: 150 },
          { id: "normal-pasta", name: "Normal Pasta", price: 150 },
          { id: "pasta-be-atekilt", name: "Pasta be Atekilt", price: 150 },
          { id: "normal-atekilt", name: "Normal Atekilt", price: 150 },
          { id: "ruz-be-atekilt", name: "Ruz be Atekilt", price: 150 },
          { id: "shiro-feses", name: "Shiro Feses", price: 130 },
          { id: "tomato-lebleb", name: "Tomato Lebleb", price: 150 },
          { id: "tegabno", name: "Tegabno", price: 200 },
          { id: "telba-fitfit", name: "Telba Fitfit", price: 200 },
          { id: "suf-fitfit", name: "Suf Fitfit", price: 200 },
          { id: "beyaynet", name: "Beyaynet", price: 150 },
          { id: "special-pasta", name: "Special Pasta", price: 250 },
          { id: "special-atekilt", name: "Special Atekilt", price: 250 },
          { id: "special-firfir", name: "Special Firfir", price: 250 },
          { id: "special-ayib", name: "Special Ayib", price: 300 },
          { id: "dulet-special", name: "Dulet Special", price: 320 },
          { id: "dulet-normal", name: "Dulet Normal", price: 300 },
          { id: "senber", name: "Senber", price: 300 },
          { id: "collection", name: "Collection", price: 350 },
          { id: "tibs", name: "Tibs", price: 350 },
          { id: "enkulal-besiga", name: "Enkulal besiga", price: 300 },
          { id: "enkulal-firfir-main", name: "Enkulal Firfir", price: 200 },
          { id: "enkulal-silis", name: "Enkulal Silis", price: 200 },
          { id: "pasta-be-siga", name: "Pasta be Siga", price: 300 },
          { id: "atekilt-besiga", name: "Atekilt besiga", price: 300 },
          { id: "firfir-be-qibe", name: "Firfir be Qibe", price: 180 },
          { id: "misir-besiga", name: "Misir besiga", price: 300 },
          { id: "dinich-besiga", name: "Dinich besiga", price: 300 },
          { id: "ayib-besiga", name: "Ayib besiga", price: 350 },
          { id: "ayib-beqibe", name: "Ayib beqibe", price: 200 },
          { id: "misir-beqibe", name: "Misir beqibe", price: 200 },
          { id: "shiro-beqibe", name: "Shiro beqibe", price: 200 },
          { id: "tefersho", name: "Tefersho", price: 400 },
          { id: "tegabino-beqibe", name: "Tegabino beqibe", price: 220 },
          { id: "bozena-shiro", name: "Bozena Shiro", price: 300 },
          { id: "firfir-with-meat", name: "Firfir with Meat", price: 300 },
          { id: "key-wot", name: "Key Wot", price: 300 },
          { id: "misto", name: "Misto", price: 300 },
          { id: "mulu-cornis", name: "Mulu Cornis", price: 1000 },
          { id: "half-cornis", name: "Half Cornis", price: 500 },
          { id: "mayberaw", name: "Mayberaw", price: 500 },
          { id: "kitfo", name: "Kitfo", price: 600 },
          { id: "key-fresh", name: "Key Fresh", price: 350 },
          { id: "alicha-fresh", name: "Alicha Fresh", price: 350 },
          { id: "soft-drinks", name: "Soft Drinks", price: 40 },
          { id: "water-1-liter", name: "Water (1 Liter)", price: 30 },
          { id: "water-2-liters", name: "Water (2 Liters)", price: 40 },
        ],
      },
      {
        id: "sunny-burger",
        name: "Sunny Burger",
        takeawayFee: 50,
        location: {
          latitude: 7.0377603,
          longitude: 38.4851218,
        },
        menu: [
          { id: "sunny-ultra", name: "Sunny Ultra", price: 1430 },
          { id: "triple", name: "Triple", price: 770 },
          { id: "texas-style", name: "Texas Style", price: 690 },
          { id: "saucy-melt", name: "Saucy Melt", price: 590 },
          { id: "beef-with-chicken", name: "Beef with Chicken", price: 630 },
          { id: "crispy-chicken", name: "Crispy Chicken", price: 710 },
          { id: "sunny-chilli", name: "Sunny Chilli", price: 540 },
          { id: "double-trouble", name: "Double Trouble", price: 520 },
          { id: "cheese-chunk", name: "Cheese Chunk", price: 460 },
          { id: "beef-chunk", name: "Beef Chunk", price: 410 },
          { id: "fasting-burger", name: "Fasting Burger", price: 350 },
          { id: "doctors-pills-2-tabs", name: "Doctor's Pills (2 Tabs)", price: 620 },
          { id: "doctors-pills-3-tabs", name: "Doctor's Pills (3 Tabs)", price: 860 },
          { id: "doctors-pills-4-tabs", name: "Doctor's Pills (4 Tabs)", price: 1120 },
        ],
      },
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async listCafes(): Promise<Cafe[]> {
    return this.cafes;
  }

  async getCafe(id: string): Promise<Cafe | undefined> {
    return this.cafes.find((cafe) => cafe.id === id);
  }

  async getSession(chatId: string): Promise<BotSession> {
    const existing = this.sessions.get(chatId);
    if (existing) {
      return existing;
    }

    const session: BotSession = { chatId, cart: [] };
    this.sessions.set(chatId, session);
    return session;
  }

  async saveSession(session: BotSession): Promise<BotSession> {
    this.sessions.set(session.chatId, session);
    return session;
  }

  async clearSession(chatId: string): Promise<void> {
    const existing = this.sessions.get(chatId);
    this.sessions.set(chatId, {
      chatId,
      cart: [],
      username: existing?.username,
      language: existing?.language,
    });
  }

  async createOrder(orderInput: Omit<Order, "id" | "createdAt">): Promise<Order> {
    const id = `KD-${Math.floor(1000 + Math.random() * 9000)}`;
    const order: Order = {
      ...orderInput,
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
  ): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) {
      return undefined;
    }

    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }

  async listOrdersForCustomer(chatId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.customerChatId === chatId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
