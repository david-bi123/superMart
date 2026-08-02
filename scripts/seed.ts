import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { Business } from "../src/models/Business";
import { User } from "../src/models/User";
import { Branch } from "../src/models/Branch";
import { Product } from "../src/models/Product";
import { Category } from "../src/models/Category";
import { Brand } from "../src/models/Brand";
import { Supplier } from "../src/models/Supplier";
import { Customer } from "../src/models/Customer";
import { Sale } from "../src/models/Sale";
import { SaleItem } from "../src/models/SaleItem";
import { PurchaseOrder } from "../src/models/PurchaseOrder";
import { InventoryMovement } from "../src/models/InventoryMovement";
import { Expense } from "../src/models/Expense";
import { ExpenseCategory as ExpenseCategoryModel } from "../src/models/ExpenseCategory";
import { Subscription } from "../src/models/Subscription";
import { Payment } from "../src/models/Payment";
import { Receipt } from "../src/models/Receipt";
import { Notification } from "../src/models/Notification";
import { AuditLog } from "../src/models/AuditLog";
import { Coupon } from "../src/models/Coupon";
import { Tax } from "../src/models/Tax";
import { Session } from "../src/models/Session";
import { Image as ImageModel } from "../src/models/Image";
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is required");
  process.exit(1);
}

const PASSWORD = "Demo@123456";
const ADMIN_PASSWORD = "Admin@123456";
const BCRYPT_SALT_ROUNDS = 10;
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }
function pickN<T>(arr: T[], n: number): T[] { return [...arr].sort(() => Math.random() - 0.5).slice(0, n); }
function randFloat(min: number, max: number): number { return +(Math.random() * (max - min) + min).toFixed(2); }
function daysAgo(days: number): Date { const d = new Date(); d.setDate(d.getDate() - days); return d; }
function randomDate(daysBack: number): Date { return daysAgo(rand(0, daysBack)); }
function generateSKU(prefix: string, i: number): string { return prefix + "-" + String(i).padStart(5, "0"); }
function generateBarcode(): string {
  let b = "2" + String(rand(100000000, 999999999));
  const d = b.split("").map(Number);
  const c = (10 - (d.reduce((s, v, i) => s + v * (i % 2 === 0 ? 1 : 3), 0) % 10)) % 10;
  return b + c;
}
const PAYMENT_METHODS = ["cash", "card", "mobile_money", "mixed"] as const;
const SALE_STATUSES: ("completed" | "refunded" | "cancelled")[] = ["completed", "completed", "completed", "completed", "refunded", "cancelled"];
const PO_STATUSES: ("pending" | "approved" | "received" | "partial" | "cancelled")[] = ["pending", "approved", "received", "received", "partial", "cancelled"];

const FIRST_NAMES = ["James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Christopher","Karen","Charles","Lisa","Daniel","Nancy","Matthew","Betty","Anthony","Margaret","Mark","Sandra","Donald","Ashley","Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle","Kenneth","Carol","Kevin","Amanda","Brian","Dorothy","George","Melissa","Timothy","Deborah","Ronald","Stephanie","Edward","Rebecca","Jason","Sharon","Jeffrey","Laura","Ryan","Cynthia","Jacob","Kathleen","Gary","Amy","Nicholas","Angela","Eric","Shirley","Jonathan","Anna","Stephen","Brenda","Larry","Pamela","Justin","Emma","Scott","Nicole","Brandon","Helen","Benjamin","Samantha","Samuel","Katherine","Raymond","Christine","Gregory","Debra","Frank","Rachel","Alexander","Carolyn","Patrick","Janet","Jack","Catherine","Dennis","Maria","Jerry","Heather"];

const LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Parker","Cruz","Edwards","Collins","Reyes","Stewart","Morris","Morales","Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper","Peterson","Bailey","Reed","Kelly","Howard","Ramos","Kim","Cox","Ward","Richardson","Watson","Brooks","Chavez","Wood","James","Bennett","Gray","Mendoza","Ruiz","Hughes","Price","Alvarez","Castillo","Sanders","Patel","Myers","Long","Ross","Foster","Jimenez"];

const STREETS = ["Oak St","Maple Ave","Elm St","Main St","Broadway","Pine Rd","Cedar Ln","Washington Blvd","Park Ave","Lake Dr","Hill St","River Rd","Forest Ave","Sunset Blvd","Highland Ave","Church St","Market St","Spring St","School St","Center St"];

const CITIES_STATES: { city: string; state: string; zip: string }[] = [
  { city: "New York", state: "NY", zip: "10001" },{ city: "Los Angeles", state: "CA", zip: "90001" },{ city: "Chicago", state: "IL", zip: "60601" },
  { city: "Houston", state: "TX", zip: "77001" },{ city: "Phoenix", state: "AZ", zip: "85001" },{ city: "Philadelphia", state: "PA", zip: "19101" },
  { city: "San Antonio", state: "TX", zip: "78201" },{ city: "San Diego", state: "CA", zip: "92101" },{ city: "Dallas", state: "TX", zip: "75201" },
  { city: "San Jose", state: "CA", zip: "95101" },{ city: "Austin", state: "TX", zip: "73301" },{ city: "Jacksonville", state: "FL", zip: "32201" },
  { city: "Fort Worth", state: "TX", zip: "76101" },{ city: "Columbus", state: "OH", zip: "43201" },{ city: "Charlotte", state: "NC", zip: "28201" },
  { city: "Indianapolis", state: "IN", zip: "46201" },{ city: "San Francisco", state: "CA", zip: "94101" },{ city: "Seattle", state: "WA", zip: "98101" },
  { city: "Denver", state: "CO", zip: "80201" },{ city: "Nashville", state: "TN", zip: "37201" },{ city: "Miami", state: "FL", zip: "33101" },
  { city: "Portland", state: "OR", zip: "97201" },{ city: "Boston", state: "MA", zip: "02101" },{ city: "Atlanta", state: "GA", zip: "30301" },{ city: "Detroit", state: "MI", zip: "48201" },
];
const SUPPLIER_COMPANIES = ["Fresh Foods Distribution","Quality Goods Supply","Premier Wholesale Co","Golden State Distributors","Atlantic Food Services","Pacific Supply Chain","Metro Grocery Wholesale","National Food Distributors","Heritage Foods Supply","Summit Distribution Inc","Crown Food Services","Liberty Wholesale Group","Evergreen Supply Co","Pioneer Food Distributors","Crescent Supply Chain","Titan Wholesale Inc","Apex Food Distribution","Elite Supply Solutions","Prime Source Distributors","Summit Trading Co","Valley Food Supply","Horizon Distributors","Keystone Food Services","Meridian Supply Group","Consolidated Food Supply","Alliance Wholesale Inc","Superior Distribution Co","Select Food Services","Cornerstone Supply","Heritage Wholesale Group","Main Street Distributors","Republic Food Supply","Crown Distribution Inc","Sterling Supply Co","Regal Food Services","Magnum Wholesale Group","Premier Food Distributors","Vanguard Supply Chain","Century Food Supply","Olympic Distributors","Sierra Food Services","Noble Wholesale Inc","Pinnacle Supply Co","Columbia Food Distributors","Benchmark Supply Group","Atlas Food Services","Phoenix Distribution Inc","Legacy Wholesale Co","Orion Food Supply","Capitol Distributors","Ridge Food Services","Summit Wholesale Group","Park Avenue Supply","Harbor Food Distributors","Beacon Supply Company","Gateway Food Services","Prestige Wholesale Inc","Triumph Distribution Co","Infinity Food Supply","Majestic Distributors"];

const BRAND_NAMES = [
  { name: "Nestl\u00e9", slug: "nestle" },{ name: "Coca-Cola", slug: "coca-cola" },{ name: "PepsiCo", slug: "pepsico" },
  { name: "Procter & Gamble", slug: "procter-gamble" },{ name: "Unilever", slug: "unilever" },{ name: "Kraft Heinz", slug: "kraft-heinz" },
  { name: "General Mills", slug: "general-mills" },{ name: "Kellogg's", slug: "kelloggs" },{ name: "Samsung", slug: "samsung" },
  { name: "Sony", slug: "sony" },{ name: "Apple", slug: "apple" },{ name: "Adidas", slug: "adidas" },{ name: "Nike", slug: "nike" },
  { name: "L'Or\u00e9al", slug: "loreal" },{ name: "Colgate", slug: "colgate" },{ name: "Johnson & Johnson", slug: "johnson-johnson" },
  { name: "3M", slug: "3m" },{ name: "Scotch", slug: "scotch" },{ name: "Post-it", slug: "post-it" },{ name: "HP", slug: "hp" },
  { name: "Canon", slug: "canon" },{ name: "DHL Supply Chain", slug: "dhl-supply-chain" },{ name: "Nature's Best", slug: "natures-best" },
  { name: "FreshDirect", slug: "freshdirect" },{ name: "GreenLeaf Organics", slug: "greenleaf-organics" },
];

const CATEGORY_STRUCTURE: { name: string; slug: string; children?: { name: string; slug: string }[] }[] = [
  { name: "Food & Beverages", slug: "food-beverages", children: [{ name: "Dairy", slug: "dairy" },{ name: "Bakery", slug: "bakery" },{ name: "Beverages", slug: "beverages" },{ name: "Snacks", slug: "snacks" }] },
  { name: "Household", slug: "household", children: [{ name: "Cleaning", slug: "cleaning" },{ name: "Kitchen", slug: "kitchen" },{ name: "Laundry", slug: "laundry" }] },
  { name: "Personal Care", slug: "personal-care", children: [{ name: "Skincare", slug: "skincare" },{ name: "Haircare", slug: "haircare" },{ name: "Oral Care", slug: "oral-care" }] },
  { name: "Electronics", slug: "electronics", children: [{ name: "Accessories", slug: "accessories" },{ name: "Cables", slug: "cables" }] },
  { name: "Stationery", slug: "stationery", children: [{ name: "Office", slug: "office" },{ name: "School", slug: "school" }] },
];

const EXPENSE_CATEGORY_NAMES: string[] = ["Rent & Leases","Utilities","Salaries & Wages","Marketing & Advertising","Maintenance & Repairs","Office Supplies","Transportation & Logistics","Insurance","Technology & Software","Professional Services","Taxes & Licenses","Inventory Purchases","Equipment","Training & Development","Miscellaneous"];

const MOVEMENT_TYPES: string[] = ["stock_in","stock_out","adjustment","transfer","return","damaged","expired"];

interface ProdT { n: string; cat: string; br: string; minP: number; maxP: number; minS: number; maxS: number; exp?: boolean; bat?: boolean; minSt?: number; maxSt?: number; unit?: string; vars?: { a: string; b: string; m: number }[] }
const PROD_TEMPLATES: ProdT[] = [
  { n:"Whole Milk",cat:"dairy",br:"freshdirect",minP:1.8,maxP:2.5,minS:3.49,maxS:4.29,exp:true,bat:true,minSt:20,maxSt:80,unit:"gal" },
  { n:"2% Reduced Fat Milk",cat:"dairy",br:"freshdirect",minP:1.8,maxP:2.5,minS:3.49,maxS:4.29,exp:true,bat:true,minSt:20,maxSt:80,unit:"gal" },
  { n:"Skim Milk",cat:"dairy",br:"freshdirect",minP:1.8,maxP:2.4,minS:3.29,maxS:4.19,exp:true,bat:true,minSt:15,maxSt:60,unit:"gal" },
  { n:"Plain Yogurt",cat:"dairy",br:"nestle",minP:0.8,maxP:1.5,minS:1.99,maxS:3.49,exp:true,bat:true,minSt:30,maxSt:120,unit:"ea" },
  { n:"Greek Yogurt",cat:"dairy",br:"nestle",minP:1.0,maxP:1.8,minS:2.49,maxS:4.49,exp:true,bat:true,minSt:25,maxSt:100,unit:"ea" },
  { n:"Vanilla Yogurt",cat:"dairy",br:"nestle",minP:0.9,maxP:1.6,minS:2.29,maxS:3.99,exp:true,bat:true,minSt:20,maxSt:80,unit:"ea" },
  { n:"Cheddar Cheese Block",cat:"dairy",br:"kraft-heinz",minP:2.5,maxP:4.0,minS:5.99,maxS:8.99,exp:true,bat:true,minSt:15,maxSt:60,unit:"lb" },
  { n:"Mozzarella Cheese",cat:"dairy",br:"kraft-heinz",minP:2.0,maxP:3.5,minS:4.99,maxS:7.99,exp:true,bat:true,minSt:15,maxSt:50,unit:"lb" },
  { n:"Swiss Cheese Slices",cat:"dairy",br:"kraft-heinz",minP:2.5,maxP:3.8,minS:5.49,maxS:7.49,exp:true,bat:true,minSt:10,maxSt:40,unit:"pk" },
  { n:"Unsalted Butter",cat:"dairy",br:"freshdirect",minP:2.0,maxP:3.0,minS:4.99,maxS:6.99,exp:true,bat:true,minSt:20,maxSt:70,unit:"lb" },
  { n:"Salted Butter",cat:"dairy",br:"freshdirect",minP:2.0,maxP:3.0,minS:4.99,maxS:6.99,exp:true,bat:true,minSt:20,maxSt:70,unit:"lb" },
  { n:"Heavy Cream",cat:"dairy",br:"freshdirect",minP:2.5,maxP:3.5,minS:5.49,maxS:7.49,exp:true,bat:true,minSt:10,maxSt:40,unit:"pt" },
  { n:"Large Eggs (Dozen)",cat:"dairy",br:"natures-best",minP:2.0,maxP:3.0,minS:4.99,maxS:7.99,exp:true,bat:true,minSt:30,maxSt:120,unit:"doz" },
  { n:"Organic Eggs (Dozen)",cat:"dairy",br:"natures-best",minP:3.5,maxP:5.0,minS:6.99,maxS:9.99,exp:true,bat:true,minSt:20,maxSt:80,unit:"doz" },
  { n:"Sour Cream",cat:"dairy",br:"freshdirect",minP:1.2,maxP:2.0,minS:2.99,maxS:4.49,exp:true,bat:true,minSt:15,maxSt:50,unit:"ea" },
  { n:"Cream Cheese",cat:"dairy",br:"kraft-heinz",minP:1.5,maxP:2.5,minS:3.49,maxS:5.49,exp:true,bat:true,minSt:15,maxSt:50,unit:"ea" },
  { n:"Buttermilk",cat:"dairy",br:"freshdirect",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,exp:true,bat:true,minSt:10,maxSt:40,unit:"ea" },
  { n:"Whipped Cream (8oz)",cat:"dairy",br:"freshdirect",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,exp:true,bat:true,minSt:10,maxSt:40,unit:"ea" },
  { n:"Cottage Cheese (16oz)",cat:"dairy",br:"kraft-heinz",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,exp:true,bat:true,minSt:12,maxSt:45,unit:"ea" },
  { n:"Ricotta Cheese (15oz)",cat:"dairy",br:"kraft-heinz",minP:2.5,maxP:3.5,minS:4.99,maxS:6.99,exp:true,bat:true,minSt:10,maxSt:35,unit:"ea" },
  { n:"String Cheese (12-pack)",cat:"dairy",br:"kraft-heinz",minP:3.0,maxP:4.5,minS:5.99,maxS:7.99,exp:true,bat:true,minSt:15,maxSt:50,unit:"pk" },
  { n:"Egg Whites (32oz)",cat:"dairy",br:"natures-best",minP:2.5,maxP:4.0,minS:5.49,maxS:7.99,exp:true,bat:true,minSt:10,maxSt:40,unit:"ea" },
  // Bakery
  { n:"White Bread",cat:"bakery",br:"general-mills",minP:1.0,maxP:1.8,minS:2.49,maxS:3.99,exp:true,bat:true,minSt:25,maxSt:100,unit:"loaf" },
  { n:"Whole Wheat Bread",cat:"bakery",br:"general-mills",minP:1.2,maxP:2.0,minS:2.99,maxS:4.49,exp:true,bat:true,minSt:25,maxSt:100,unit:"loaf" },
  { n:"Sourdough Bread",cat:"bakery",br:"general-mills",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,exp:true,bat:true,minSt:15,maxSt:50,unit:"loaf" },
  { n:"Rye Bread",cat:"bakery",br:"general-mills",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,exp:true,bat:true,minSt:10,maxSt:40,unit:"loaf" },
  { n:"Plain Bagels (6-pack)",cat:"bakery",br:"general-mills",minP:1.5,maxP:2.5,minS:3.99,maxS:5.49,exp:true,bat:true,minSt:20,maxSt:70,unit:"pk" },
  { n:"Everything Bagels (6-pack)",cat:"bakery",br:"general-mills",minP:1.5,maxP:2.5,minS:3.99,maxS:5.49,exp:true,bat:true,minSt:15,maxSt:60,unit:"pk" },
  { n:"Blueberry Muffins (4-pack)",cat:"bakery",br:"general-mills",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,exp:true,bat:true,minSt:15,maxSt:50,unit:"pk" },
  { n:"Chocolate Chip Muffins (4-pack)",cat:"bakery",br:"general-mills",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,exp:true,bat:true,minSt:15,maxSt:50,unit:"pk" },
  { n:"Croissants (4-pack)",cat:"bakery",br:"freshdirect",minP:2.5,maxP:3.5,minS:5.49,maxS:6.99,exp:true,bat:true,minSt:10,maxSt:40,unit:"pk" },
  { n:"Chocolate Chip Cookies",cat:"bakery",br:"nestle",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Oatmeal Cookies",cat:"bakery",br:"nestle",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:70,unit:"pk" },
  { n:"Vanilla Cake",cat:"bakery",br:"freshdirect",minP:5.0,maxP:8.0,minS:12.99,maxS:19.99,exp:true,bat:true,minSt:5,maxSt:20,unit:"ea" },
  { n:"Whole Grain Bread",cat:"bakery",br:"general-mills",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,exp:true,bat:true,minSt:20,maxSt:70,unit:"loaf" },
  { n:"English Muffins (6-pack)",cat:"bakery",br:"general-mills",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,exp:true,bat:true,minSt:15,maxSt:60,unit:"pk" },
  { n:"Tortillas (10-pack)",cat:"bakery",br:"general-mills",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,exp:true,bat:true,minSt:15,maxSt:60,unit:"pk" },
  { n:"Brownies (4-pack)",cat:"bakery",br:"nestle",minP:2.0,maxP:3.5,minS:4.99,maxS:6.49,minSt:15,maxSt:50,unit:"pk" },
  { n:"Banana Nut Muffins (4-pack)",cat:"bakery",br:"general-mills",minP:2.5,maxP:3.5,minS:5.49,maxS:6.99,exp:true,bat:true,minSt:10,maxSt:40,unit:"pk" },
  { n:"Brioche Bread",cat:"bakery",br:"general-mills",minP:2.5,maxP:3.5,minS:5.49,maxS:6.99,exp:true,bat:true,minSt:10,maxSt:35,unit:"loaf" },
  // Beverages
  { n:"Spring Water (1L)",cat:"beverages",br:"nestle",minP:0.3,maxP:0.6,minS:0.99,maxS:1.99,minSt:50,maxSt:200,unit:"ea" },
  { n:"Spring Water (500ml)",cat:"beverages",br:"nestle",minP:0.2,maxP:0.4,minS:0.79,maxS:1.49,minSt:50,maxSt:200,unit:"ea" },
  { n:"Sparkling Water",cat:"beverages",br:"nestle",minP:0.5,maxP:1.0,minS:1.49,maxS:2.49,minSt:30,maxSt:120,unit:"ea" },
  { n:"Coca-Cola Classic (2L)",cat:"beverages",br:"coca-cola",minP:1.0,maxP:1.5,minS:2.49,maxS:3.49,minSt:40,maxSt:150,unit:"ea" },
  { n:"Coca-Cola Classic Can (12pk)",cat:"beverages",br:"coca-cola",minP:3.0,maxP:4.5,minS:6.99,maxS:9.99,minSt:30,maxSt:100,unit:"pk" },
  { n:"Diet Coke (2L)",cat:"beverages",br:"coca-cola",minP:1.0,maxP:1.5,minS:2.49,maxS:3.49,minSt:30,maxSt:120,unit:"ea" },
  { n:"Pepsi (2L)",cat:"beverages",br:"pepsico",minP:1.0,maxP:1.5,minS:2.29,maxS:3.29,minSt:30,maxSt:120,unit:"ea" },
  { n:"Mountain Dew (2L)",cat:"beverages",br:"pepsico",minP:1.0,maxP:1.5,minS:2.29,maxS:3.29,minSt:25,maxSt:100,unit:"ea" },
  { n:"Orange Juice (64oz)",cat:"beverages",br:"freshdirect",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,exp:true,bat:true,minSt:20,maxSt:80,unit:"ea" },
  { n:"Apple Juice (64oz)",cat:"beverages",br:"freshdirect",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,exp:true,bat:true,minSt:20,maxSt:70,unit:"ea" },
  { n:"Cranberry Juice (64oz)",cat:"beverages",br:"freshdirect",minP:2.0,maxP:3.5,minS:4.99,maxS:6.49,exp:true,bat:true,minSt:15,maxSt:60,unit:"ea" },
  { n:"Iced Tea (1 gal)",cat:"beverages",br:"pepsico",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Ground Coffee (12oz)",cat:"beverages",br:"nestle",minP:3.0,maxP:5.0,minS:7.99,maxS:12.99,exp:true,minSt:15,maxSt:60,unit:"ea" },
  { n:"Green Tea Bags (100ct)",cat:"beverages",br:"nestle",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Energy Drink (12oz)",cat:"beverages",br:"pepsico",minP:1.0,maxP:1.8,minS:2.49,maxS:3.99,minSt:30,maxSt:100,unit:"ea" },
  { n:"Coconut Water (16oz)",cat:"beverages",br:"freshdirect",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Lemonade (64oz)",cat:"beverages",br:"freshdirect",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,exp:true,minSt:15,maxSt:60,unit:"ea" },
  { n:"Sports Drink (32oz)",cat:"beverages",br:"pepsico",minP:1.0,maxP:1.8,minS:2.49,maxS:3.69,minSt:25,maxSt:100,unit:"ea" },
  { n:"Ginger Ale (2L)",cat:"beverages",br:"coca-cola",minP:1.0,maxP:1.5,minS:2.29,maxS:3.29,minSt:20,maxSt:80,unit:"ea" },
  { n:"Root Beer (2L)",cat:"beverages",br:"pepsico",minP:1.0,maxP:1.5,minS:2.29,maxS:3.29,minSt:20,maxSt:80,unit:"ea" },
  { n:"Coffee Beans (16oz)",cat:"beverages",br:"nestle",minP:5.0,maxP:8.0,minS:12.99,maxS:18.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Hot Chocolate Mix (16oz)",cat:"beverages",br:"nestle",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,minSt:15,maxSt:50,unit:"ea" },
  // Snacks
  { n:"Potato Chips Original (8oz)",cat:"snacks",br:"pepsico",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:30,maxSt:120,unit:"ea" },
  { n:"Potato Chips BBQ (8oz)",cat:"snacks",br:"pepsico",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:30,maxSt:100,unit:"ea" },
  { n:"Tortilla Chips (12oz)",cat:"snacks",br:"pepsico",minP:2.0,maxP:3.0,minS:3.99,maxS:5.49,minSt:25,maxSt:100,unit:"ea" },
  { n:"Cheese Crackers (12oz)",cat:"snacks",br:"kraft-heinz",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Peanut Butter Pretzels",cat:"snacks",br:"kraft-heinz",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Mixed Nuts (16oz)",cat:"snacks",br:"natures-best",minP:4.0,maxP:6.0,minS:8.99,maxS:12.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Almonds (12oz)",cat:"snacks",br:"natures-best",minP:5.0,maxP:7.0,minS:10.99,maxS:14.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Cashews (12oz)",cat:"snacks",br:"natures-best",minP:5.0,maxP:7.5,minS:11.99,maxS:15.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Milk Chocolate Bar",cat:"snacks",br:"nestle",minP:0.8,maxP:1.5,minS:1.99,maxS:3.49,minSt:40,maxSt:150,unit:"ea" },
  { n:"Dark Chocolate Bar",cat:"snacks",br:"nestle",minP:1.0,maxP:1.8,minS:2.49,maxS:3.99,minSt:30,maxSt:120,unit:"ea" },
  { n:"Granola Bars (8-pack)",cat:"snacks",br:"general-mills",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Trail Mix (16oz)",cat:"snacks",br:"natures-best",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Beef Jerky (3oz)",cat:"snacks",br:"freshdirect",minP:2.5,maxP:4.0,minS:5.99,maxS:8.49,minSt:15,maxSt:50,unit:"ea" },
  { n:"Popcorn Kernels (32oz)",cat:"snacks",br:"general-mills",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:70,unit:"ea" },
  { n:"Saltine Crackers (16oz)",cat:"snacks",br:"kraft-heinz",minP:1.5,maxP:2.5,minS:3.29,maxS:4.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Rice Cakes (10-pack)",cat:"snacks",br:"natures-best",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,minSt:20,maxSt:80,unit:"pk" },
  { n:"Pretzel Sticks (16oz)",cat:"snacks",br:"pepsico",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Dried Cranberries (12oz)",cat:"snacks",br:"natures-best",minP:3.0,maxP:5.0,minS:6.99,maxS:8.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Protein Bars (5-pack)",cat:"snacks",br:"general-mills",minP:4.0,maxP:6.0,minS:8.99,maxS:11.99,minSt:15,maxSt:50,unit:"pk" },
  { n:"Sunflower Seeds (12oz)",cat:"snacks",br:"natures-best",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Pita Chips (9oz)",cat:"snacks",br:"pepsico",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:15,maxSt:60,unit:"ea" },
  // Cleaning
  { n:"All-Purpose Cleaner (32oz)",cat:"cleaning",br:"procter-gamble",minP:1.5,maxP:2.5,minS:3.49,maxS:5.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Glass Cleaner (26oz)",cat:"cleaning",br:"procter-gamble",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:70,unit:"ea" },
  { n:"Dish Soap (28oz)",cat:"cleaning",br:"procter-gamble",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:25,maxSt:100,unit:"ea" },
  { n:"Bleach (64oz)",cat:"cleaning",br:"procter-gamble",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Disinfecting Wipes (75ct)",cat:"cleaning",br:"procter-gamble",minP:2.0,maxP:3.5,minS:4.99,maxS:7.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Multi-Surface Cleaner",cat:"cleaning",br:"procter-gamble",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Bathroom Cleaner (32oz)",cat:"cleaning",br:"unilever",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Hand Soap (12oz)",cat:"cleaning",br:"unilever",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:25,maxSt:100,unit:"ea" },
  { n:"Hand Sanitizer (8oz)",cat:"cleaning",br:"unilever",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:25,maxSt:100,unit:"ea" },
  { n:"Sponge (5-pack)",cat:"cleaning",br:"3m",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Toilet Bowl Cleaner",cat:"cleaning",br:"procter-gamble",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Furniture Polish",cat:"cleaning",br:"unilever",minP:3.0,maxP:4.5,minS:5.99,maxS:7.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Microfiber Cloths (6-pack)",cat:"cleaning",br:"3m",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,minSt:15,maxSt:60,unit:"pk" },
  { n:"Carpet Cleaner (32oz)",cat:"cleaning",br:"procter-gamble",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Scrub Brush",cat:"cleaning",br:"3m",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Window Cleaner (32oz)",cat:"cleaning",br:"procter-gamble",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:15,maxSt:60,unit:"ea" },
  // Kitchen
  { n:"Paper Towels (6-roll)",cat:"kitchen",br:"procter-gamble",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Paper Napkins (200ct)",cat:"kitchen",br:"procter-gamble",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:70,unit:"ea" },
  { n:"Trash Bags (30gal, 30ct)",cat:"kitchen",br:"procter-gamble",minP:2.5,maxP:4.0,minS:5.99,maxS:8.49,minSt:20,maxSt:70,unit:"ea" },
  { n:"Aluminum Foil (75sqft)",cat:"kitchen",br:"3m",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Plastic Wrap (200sqft)",cat:"kitchen",br:"3m",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Parchment Paper (60sqft)",cat:"kitchen",br:"scotch",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:15,maxSt:50,unit:"ea" },
  { n:"Ziploc Bags Gallon (50ct)",cat:"kitchen",br:"3m",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,minSt:20,maxSt:70,unit:"ea" },
  { n:"Dishwasher Detergent (25oz)",cat:"kitchen",br:"procter-gamble",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Food Storage Containers",cat:"kitchen",br:"scotch",minP:3.0,maxP:5.0,minS:7.99,maxS:11.99,minSt:15,maxSt:50,unit:"pk" },
  { n:"Trash Bags (13gal, 50ct)",cat:"kitchen",br:"procter-gamble",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Dishwasher Pods (20ct)",cat:"kitchen",br:"procter-gamble",minP:4.0,maxP:6.0,minS:8.99,maxS:11.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Wax Paper (75sqft)",cat:"kitchen",br:"3m",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:15,maxSt:50,unit:"ea" },
  // Laundry
  { n:"Laundry Detergent (50oz)",cat:"laundry",br:"procter-gamble",minP:4.0,maxP:6.0,minS:8.99,maxS:12.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Laundry Pods (24ct)",cat:"laundry",br:"procter-gamble",minP:5.0,maxP:7.0,minS:10.99,maxS:14.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Fabric Softener (60oz)",cat:"laundry",br:"unilever",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Stain Remover (22oz)",cat:"laundry",br:"procter-gamble",minP:2.0,maxP:3.5,minS:4.99,maxS:7.49,minSt:15,maxSt:50,unit:"ea" },
  { n:"Dryer Sheets (120ct)",cat:"laundry",br:"unilever",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:20,maxSt:70,unit:"ea" },
  { n:"Laundry Bleach (64oz)",cat:"laundry",br:"procter-gamble",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Wrinkle Release Spray",cat:"laundry",br:"unilever",minP:3.0,maxP:4.5,minS:6.49,maxS:8.49,minSt:10,maxSt:40,unit:"ea" },
  { n:"Lint Roller (2-pack)",cat:"laundry",br:"3m",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:15,maxSt:60,unit:"pk" },
  // Skincare
  { n:"Moisturizing Cream (4oz)",cat:"skincare",br:"loreal",minP:5.0,maxP:8.0,minS:12.99,maxS:19.99,bat:true,minSt:10,maxSt:40,unit:"ea" },
  { n:"Face Wash (6oz)",cat:"skincare",br:"loreal",minP:4.0,maxP:6.0,minS:8.99,maxS:14.99,bat:true,minSt:15,maxSt:50,unit:"ea" },
  { n:"Sunscreen SPF 50 (3oz)",cat:"skincare",br:"loreal",minP:5.0,maxP:8.0,minS:11.99,maxS:16.99,exp:true,bat:true,minSt:15,maxSt:50,unit:"ea" },
  { n:"Facial Toner (8oz)",cat:"skincare",br:"loreal",minP:4.0,maxP:7.0,minS:9.99,maxS:14.99,bat:true,minSt:10,maxSt:40,unit:"ea" },
  { n:"Anti-Aging Serum (1oz)",cat:"skincare",br:"loreal",minP:10.0,maxP:15.0,minS:24.99,maxS:39.99,bat:true,minSt:10,maxSt:30,unit:"ea" },
  { n:"Body Lotion (16oz)",cat:"skincare",br:"unilever",minP:3.0,maxP:5.0,minS:6.99,maxS:10.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Lip Balm",cat:"skincare",br:"unilever",minP:0.8,maxP:1.5,minS:1.99,maxS:3.49,minSt:30,maxSt:100,unit:"ea" },
  { n:"Body Wash (16oz)",cat:"skincare",br:"unilever",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Deodorant (2.6oz)",cat:"skincare",br:"unilever",minP:2.0,maxP:3.5,minS:4.99,maxS:7.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Shaving Cream (7oz)",cat:"skincare",br:"unilever",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Razors (4-pack)",cat:"skincare",br:"procter-gamble",minP:5.0,maxP:8.0,minS:11.99,maxS:16.99,minSt:15,maxSt:50,unit:"pk" },
  { n:"Face Mask Sheet (5-pack)",cat:"skincare",br:"loreal",minP:3.0,maxP:5.0,minS:7.99,maxS:11.99,minSt:15,maxSt:50,unit:"pk" },
  { n:"Facial Cleansing Wipes",cat:"skincare",br:"loreal",minP:2.5,maxP:4.0,minS:5.99,maxS:7.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Night Cream (2oz)",cat:"skincare",br:"loreal",minP:8.0,maxP:12.0,minS:18.99,maxS:28.99,bat:true,minSt:8,maxSt:30,unit:"ea" },
  // Haircare
  { n:"Shampoo (12.6oz)",cat:"haircare",br:"loreal",minP:3.0,maxP:5.0,minS:6.99,maxS:11.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Conditioner (12.6oz)",cat:"haircare",br:"loreal",minP:3.0,maxP:5.0,minS:6.99,maxS:11.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Hair Oil (4oz)",cat:"haircare",br:"loreal",minP:4.0,maxP:7.0,minS:9.99,maxS:14.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Hair Gel (6oz)",cat:"haircare",br:"unilever",minP:2.0,maxP:4.0,minS:4.99,maxS:7.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Hair Spray (8oz)",cat:"haircare",br:"loreal",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Dry Shampoo (5oz)",cat:"haircare",br:"unilever",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Hair Mask (8oz)",cat:"haircare",br:"loreal",minP:5.0,maxP:8.0,minS:12.99,maxS:17.99,minSt:10,maxSt:35,unit:"ea" },
  { n:"Hairbrush",cat:"haircare",br:"loreal",minP:3.0,maxP:5.0,minS:7.99,maxS:11.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Hair Ties (24-pack)",cat:"haircare",br:"loreal",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Leave-In Conditioner",cat:"haircare",br:"loreal",minP:4.0,maxP:6.0,minS:8.99,maxS:12.99,minSt:10,maxSt:40,unit:"ea" },
  // Oral Care
  { n:"Toothpaste (6oz)",cat:"oral-care",br:"colgate",minP:1.5,maxP:2.5,minS:3.49,maxS:5.49,minSt:30,maxSt:120,unit:"ea" },
  { n:"Whitening Toothpaste",cat:"oral-care",br:"colgate",minP:2.0,maxP:3.5,minS:4.99,maxS:7.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Soft Toothbrush (2-pack)",cat:"oral-care",br:"colgate",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:25,maxSt:100,unit:"pk" },
  { n:"Electric Toothbrush Head",cat:"oral-care",br:"colgate",minP:5.0,maxP:8.0,minS:11.99,maxS:16.99,minSt:10,maxSt:40,unit:"pk" },
  { n:"Mouthwash (33.8oz)",cat:"oral-care",br:"colgate",minP:2.5,maxP:4.0,minS:5.49,maxS:7.99,minSt:20,maxSt:70,unit:"ea" },
  { n:"Dental Floss (55yd)",cat:"oral-care",br:"johnson-johnson",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Tongue Cleaner",cat:"oral-care",br:"colgate",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Toothbrush Holder",cat:"oral-care",br:"colgate",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:15,maxSt:60,unit:"ea" },
  // Accessories
  { n:"Phone Case iPhone",cat:"accessories",br:"apple",minP:5.0,maxP:10.0,minS:15.99,maxS:29.99,minSt:15,maxSt:60,unit:"ea",vars:[{a:"Color",b:"Black",m:1},{a:"Color",b:"White",m:1},{a:"Color",b:"Blue",m:1}] },
  { n:"Phone Case Samsung",cat:"accessories",br:"samsung",minP:5.0,maxP:9.0,minS:14.99,maxS:24.99,minSt:15,maxSt:60,unit:"ea",vars:[{a:"Color",b:"Black",m:1},{a:"Color",b:"Clear",m:1}] },
  { n:"Screen Protector (2-pack)",cat:"accessories",br:"3m",minP:3.0,maxP:5.0,minS:8.99,maxS:14.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Wall Charger (20W)",cat:"accessories",br:"samsung",minP:5.0,maxP:8.0,minS:12.99,maxS:19.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Wireless Earbuds",cat:"accessories",br:"samsung",minP:15.0,maxP:25.0,minS:39.99,maxS:59.99,bat:true,minSt:10,maxSt:40,unit:"ea" },
  { n:"Over-Ear Headphones",cat:"accessories",br:"sony",minP:20.0,maxP:35.0,minS:49.99,maxS:79.99,bat:true,minSt:8,maxSt:30,unit:"ea" },
  { n:"Power Bank 10000mAh",cat:"accessories",br:"samsung",minP:10.0,maxP:18.0,minS:24.99,maxS:39.99,bat:true,minSt:10,maxSt:40,unit:"ea" },
  { n:"Bluetooth Speaker",cat:"accessories",br:"sony",minP:15.0,maxP:25.0,minS:34.99,maxS:49.99,bat:true,minSt:10,maxSt:40,unit:"ea" },
  { n:"Wireless Mouse",cat:"accessories",br:"hp",minP:8.0,maxP:12.0,minS:19.99,maxS:29.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"USB Hub (4-port)",cat:"accessories",br:"samsung",minP:5.0,maxP:8.0,minS:12.99,maxS:17.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Memory Card 64GB",cat:"accessories",br:"samsung",minP:8.0,maxP:12.0,minS:19.99,maxS:29.99,bat:true,minSt:10,maxSt:40,unit:"ea" },
  { n:"Laptop Stand",cat:"accessories",br:"hp",minP:10.0,maxP:18.0,minS:24.99,maxS:39.99,minSt:8,maxSt:30,unit:"ea" },
  // Cables
  { n:"USB-C Cable (6ft)",cat:"cables",br:"samsung",minP:2.0,maxP:4.0,minS:5.99,maxS:9.99,minSt:25,maxSt:100,unit:"ea" },
  { n:"Lightning Cable (6ft)",cat:"cables",br:"apple",minP:3.0,maxP:5.0,minS:7.99,maxS:12.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Micro USB Cable (6ft)",cat:"cables",br:"samsung",minP:1.5,maxP:3.0,minS:4.49,maxS:7.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"HDMI Cable (6ft)",cat:"cables",br:"sony",minP:3.0,maxP:5.0,minS:7.99,maxS:12.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Ethernet Cable (10ft)",cat:"cables",br:"3m",minP:2.0,maxP:4.0,minS:5.49,maxS:8.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"USB-A to USB-C Adapter",cat:"cables",br:"samsung",minP:1.0,maxP:2.5,minS:3.49,maxS:5.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"AUX Audio Cable (3ft)",cat:"cables",br:"sony",minP:1.5,maxP:3.0,minS:4.49,maxS:6.99,minSt:15,maxSt:60,unit:"ea" },
  // Office
  { n:"Printer Paper 8.5x11 (500ct)",cat:"office",br:"hp",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:20,maxSt:80,unit:"ea",vars:[{a:"Size",b:"500ct",m:1},{a:"Size",b:"2500ct",m:4.5}] },
  { n:"Ballpoint Pens (12-pack)",cat:"office",br:"scotch",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:30,maxSt:120,unit:"pk" },
  { n:"Permanent Markers (4pk)",cat:"office",br:"scotch",minP:1.5,maxP:2.5,minS:3.99,maxS:5.49,minSt:20,maxSt:70,unit:"pk" },
  { n:"File Folders (25-pack)",cat:"office",br:"post-it",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,minSt:15,maxSt:60,unit:"pk" },
  { n:"3-Ring Binder (1-inch)",cat:"office",br:"post-it",minP:1.5,maxP:3.0,minS:3.99,maxS:5.99,minSt:20,maxSt:70,unit:"ea" },
  { n:"Stapler Standard",cat:"office",br:"scotch",minP:3.0,maxP:5.0,minS:6.99,maxS:10.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Staples (5000ct)",cat:"office",br:"scotch",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Transparent Tape (6-roll)",cat:"office",br:"scotch",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,minSt:15,maxSt:50,unit:"pk" },
  { n:"Post-it Notes (12pk)",cat:"office",br:"post-it",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Desk Organizer",cat:"office",br:"scotch",minP:5.0,maxP:8.0,minS:12.99,maxS:17.99,minSt:8,maxSt:30,unit:"ea" },
  { n:"Scissors (8-inch)",cat:"office",br:"scotch",minP:2.0,maxP:4.0,minS:4.99,maxS:7.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Desk Lamp LED",cat:"office",br:"hp",minP:8.0,maxP:12.0,minS:19.99,maxS:29.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Business Envelopes (50)",cat:"office",br:"post-it",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:15,maxSt:60,unit:"pk" },
  { n:"Mailing Labels (100ct)",cat:"office",br:"post-it",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Whiteboard Markers (4)",cat:"office",br:"scotch",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:15,maxSt:60,unit:"pk" },
  { n:"Paper Clips (100ct)",cat:"office",br:"scotch",minP:0.5,maxP:1.5,minS:1.49,maxS:2.49,minSt:25,maxSt:100,unit:"ea" },
  { n:"Rubber Bands (1lb)",cat:"office",br:"scotch",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,minSt:15,maxSt:60,unit:"ea" },
  // School
  { n:"Composition Notebook",cat:"school",br:"post-it",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:30,maxSt:120,unit:"ea" },
  { n:"Spiral Notebook",cat:"school",br:"post-it",minP:0.8,maxP:1.5,minS:1.99,maxS:3.49,minSt:30,maxSt:120,unit:"ea" },
  { n:"#2 Pencils (24-pack)",cat:"school",br:"scotch",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:25,maxSt:100,unit:"pk" },
  { n:"Colored Pencils (24pk)",cat:"school",br:"scotch",minP:2.0,maxP:4.0,minS:5.49,maxS:8.49,minSt:15,maxSt:60,unit:"pk" },
  { n:"Erasers (12-pack)",cat:"school",br:"scotch",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Pencil Sharpener",cat:"school",br:"scotch",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:20,maxSt:70,unit:"ea" },
  { n:"Ruler (12-inch)",cat:"school",br:"scotch",minP:0.5,maxP:1.5,minS:1.49,maxS:2.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Glue Stick (4-pack)",cat:"school",br:"scotch",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Backpack Standard",cat:"school",br:"adidas",minP:10.0,maxP:18.0,minS:24.99,maxS:39.99,minSt:10,maxSt:40,unit:"ea",vars:[{a:"Color",b:"Black",m:1},{a:"Color",b:"Blue",m:1},{a:"Color",b:"Red",m:1}] },
  { n:"Lunch Box",cat:"school",br:"adidas",minP:5.0,maxP:8.0,minS:12.99,maxS:19.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Calculator Basic",cat:"school",br:"hp",minP:3.0,maxP:6.0,minS:7.99,maxS:14.99,bat:true,minSt:10,maxSt:40,unit:"ea" },
  { n:"Scientific Calculator",cat:"school",br:"canon",minP:10.0,maxP:15.0,minS:19.99,maxS:34.99,bat:true,minSt:8,maxSt:30,unit:"ea" },
  { n:"Crayons (64-pack)",cat:"school",br:"scotch",minP:1.5,maxP:3.0,minS:3.99,maxS:5.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Markers (10-pack)",cat:"school",br:"scotch",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,minSt:20,maxSt:70,unit:"pk" },
  { n:"Highlighters (5-pack)",cat:"school",br:"post-it",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Index Cards (100ct)",cat:"school",br:"post-it",minP:1.0,maxP:2.0,minS:2.49,maxS:3.49,minSt:25,maxSt:100,unit:"ea" },
  { n:"Construction Paper (50ct)",cat:"school",br:"scotch",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Safety Scissors",cat:"school",br:"scotch",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Geometry Set (5-piece)",cat:"school",br:"scotch",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,minSt:15,maxSt:50,unit:"ea" },
  // Food & Bev staples
  { n:"Canned Tomatoes (28oz)",cat:"food-beverages",br:"kraft-heinz",minP:1.0,maxP:2.0,minS:2.49,maxS:3.49,minSt:30,maxSt:100,unit:"ea" },
  { n:"Pasta (16oz)",cat:"food-beverages",br:"kraft-heinz",minP:0.8,maxP:1.5,minS:1.99,maxS:2.99,minSt:30,maxSt:120,unit:"ea" },
  { n:"Pasta Sauce (24oz)",cat:"food-beverages",br:"kraft-heinz",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Olive Oil (17oz)",cat:"food-beverages",br:"freshdirect",minP:4.0,maxP:6.0,minS:8.99,maxS:12.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Vegetable Oil (48oz)",cat:"food-beverages",br:"freshdirect",minP:2.5,maxP:4.0,minS:5.49,maxS:7.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Ketchup (32oz)",cat:"food-beverages",br:"kraft-heinz",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Mustard (20oz)",cat:"food-beverages",br:"kraft-heinz",minP:1.0,maxP:2.0,minS:2.49,maxS:3.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Mayonnaise (30oz)",cat:"food-beverages",br:"unilever",minP:2.5,maxP:4.0,minS:5.49,maxS:7.49,minSt:20,maxSt:70,unit:"ea" },
  { n:"Soy Sauce (15oz)",cat:"food-beverages",br:"kraft-heinz",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"White Rice (5lb)",cat:"food-beverages",br:"freshdirect",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Brown Rice (2lb)",cat:"food-beverages",br:"freshdirect",minP:2.0,maxP:3.0,minS:4.49,maxS:5.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"All-Purpose Flour (5lb)",cat:"food-beverages",br:"general-mills",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"White Sugar (4lb)",cat:"food-beverages",br:"freshdirect",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Brown Sugar (2lb)",cat:"food-beverages",br:"freshdirect",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Baking Soda (1lb)",cat:"food-beverages",br:"kraft-heinz",minP:0.5,maxP:1.5,minS:1.49,maxS:2.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Vanilla Extract (2oz)",cat:"food-beverages",br:"freshdirect",minP:3.0,maxP:5.0,minS:6.99,maxS:8.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Honey (12oz)",cat:"food-beverages",br:"natures-best",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Maple Syrup (12oz)",cat:"food-beverages",br:"natures-best",minP:4.0,maxP:6.0,minS:8.99,maxS:11.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Peanut Butter (16oz)",cat:"food-beverages",br:"kraft-heinz",minP:2.0,maxP:3.5,minS:4.49,maxS:5.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Strawberry Jam (12oz)",cat:"food-beverages",br:"kraft-heinz",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Cereal (18oz)",cat:"food-beverages",br:"kelloggs",minP:2.5,maxP:4.0,minS:5.49,maxS:7.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Oatmeal (18oz)",cat:"food-beverages",br:"general-mills",minP:2.0,maxP:3.5,minS:4.49,maxS:6.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Canned Soup (10.5oz)",cat:"food-beverages",br:"kraft-heinz",minP:0.8,maxP:1.5,minS:1.99,maxS:2.99,minSt:30,maxSt:120,unit:"ea" },
  { n:"Canned Beans (15oz)",cat:"food-beverages",br:"kraft-heinz",minP:0.8,maxP:1.5,minS:1.79,maxS:2.49,minSt:30,maxSt:120,unit:"ea" },
  { n:"Canned Tuna (5oz)",cat:"food-beverages",br:"kraft-heinz",minP:0.8,maxP:1.5,minS:1.99,maxS:2.99,minSt:30,maxSt:120,unit:"ea" },
  { n:"BBQ Sauce (18oz)",cat:"food-beverages",br:"kraft-heinz",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Hot Sauce (12oz)",cat:"food-beverages",br:"kraft-heinz",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Salad Dressing (16oz)",cat:"food-beverages",br:"kraft-heinz",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Cooking Spray (6oz)",cat:"food-beverages",br:"freshdirect",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Chicken Broth (32oz)",cat:"food-beverages",br:"kraft-heinz",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Frozen Pizza (12-inch)",cat:"food-beverages",br:"general-mills",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Frozen Vegetables (16oz)",cat:"food-beverages",br:"general-mills",minP:1.0,maxP:2.0,minS:2.49,maxS:3.99,minSt:25,maxSt:100,unit:"ea" },
  { n:"Frozen French Fries (32oz)",cat:"food-beverages",br:"general-mills",minP:2.0,maxP:3.5,minS:4.49,maxS:5.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Ice Cream (1.5qt)",cat:"food-beverages",br:"nestle",minP:3.0,maxP:5.0,minS:5.99,maxS:8.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Frozen Chicken Nuggets",cat:"food-beverages",br:"general-mills",minP:4.0,maxP:6.0,minS:8.49,maxS:11.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Salt (26oz)",cat:"food-beverages",br:"freshdirect",minP:0.5,maxP:1.0,minS:1.29,maxS:2.29,minSt:25,maxSt:100,unit:"ea" },
  { n:"Black Pepper (4oz)",cat:"food-beverages",br:"freshdirect",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Garlic Powder (3oz)",cat:"food-beverages",br:"freshdirect",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Cinnamon (2.5oz)",cat:"food-beverages",br:"freshdirect",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:15,maxSt:50,unit:"ea" },
  { n:"Paprika (2.5oz)",cat:"food-beverages",br:"freshdirect",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,minSt:15,maxSt:50,unit:"ea" },
  { n:"White Vinegar (16oz)",cat:"food-beverages",br:"freshdirect",minP:1.0,maxP:2.0,minS:2.49,maxS:3.49,minSt:20,maxSt:80,unit:"ea" },
  { n:"Canned Corn (15oz)",cat:"food-beverages",br:"general-mills",minP:0.6,maxP:1.2,minS:1.49,maxS:2.29,minSt:25,maxSt:100,unit:"ea" },
  { n:"Spaghetti Sauce (24oz)",cat:"food-beverages",br:"kraft-heinz",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Chili Powder (3oz)",cat:"food-beverages",br:"freshdirect",minP:1.5,maxP:2.5,minS:3.49,maxS:4.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Italian Seasoning",cat:"food-beverages",br:"freshdirect",minP:2.0,maxP:3.0,minS:4.49,maxS:5.49,minSt:15,maxSt:60,unit:"ea" },
  { n:"Nutella (13oz)",cat:"food-beverages",br:"nestle",minP:3.0,maxP:5.0,minS:6.99,maxS:8.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Frozen Waffles (12pk)",cat:"food-beverages",br:"kelloggs",minP:2.0,maxP:3.5,minS:4.49,maxS:5.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Fish Sticks (24oz)",cat:"food-beverages",br:"general-mills",minP:4.0,maxP:6.0,minS:7.99,maxS:10.99,minSt:15,maxSt:50,unit:"ea" },
  // Household/pet/baby
  { n:"LED Light Bulbs (4pk)",cat:"household",br:"samsung",minP:3.0,maxP:5.0,minS:6.99,maxS:9.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"AA Batteries (16pk)",cat:"household",br:"samsung",minP:3.0,maxP:5.0,minS:7.99,maxS:10.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"AAA Batteries (8pk)",cat:"household",br:"samsung",minP:2.5,maxP:4.0,minS:6.49,maxS:8.99,minSt:20,maxSt:80,unit:"pk" },
  { n:"Extension Cord (6ft)",cat:"household",br:"3m",minP:3.0,maxP:5.0,minS:7.99,maxS:11.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Power Strip (6-outlet)",cat:"household",br:"3m",minP:5.0,maxP:8.0,minS:12.99,maxS:17.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Flashlight LED",cat:"household",br:"samsung",minP:4.0,maxP:6.0,minS:9.99,maxS:14.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Candles (3-pack)",cat:"household",br:"freshdirect",minP:2.0,maxP:4.0,minS:5.49,maxS:8.49,minSt:15,maxSt:60,unit:"pk" },
  { n:"Air Freshener (8oz)",cat:"household",br:"procter-gamble",minP:1.5,maxP:2.5,minS:3.49,maxS:4.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Matches (300ct)",cat:"household",br:"scotch",minP:0.5,maxP:1.5,minS:1.49,maxS:2.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Trash Bags (55gal,20ct)",cat:"household",br:"procter-gamble",minP:4.0,maxP:6.0,minS:8.99,maxS:12.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Dry Dog Food (15lb)",cat:"food-beverages",br:"general-mills",minP:10.0,maxP:15.0,minS:22.99,maxS:32.99,minSt:10,maxSt:40,unit:"ea" },
  { n:"Wet Cat Food (24pk)",cat:"food-beverages",br:"general-mills",minP:8.0,maxP:12.0,minS:18.99,maxS:26.99,minSt:10,maxSt:40,unit:"pk" },
  { n:"Dog Treats (16oz)",cat:"food-beverages",br:"general-mills",minP:4.0,maxP:6.0,minS:8.99,maxS:12.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Cat Litter (20lb)",cat:"food-beverages",br:"general-mills",minP:5.0,maxP:8.0,minS:12.99,maxS:17.99,minSt:15,maxSt:50,unit:"ea" },
  { n:"Baby Diapers Size 1",cat:"personal-care",br:"johnson-johnson",minP:6.0,maxP:10.0,minS:14.99,maxS:21.99,minSt:15,maxSt:60,unit:"ea",vars:[{a:"Size",b:"Size 1",m:1},{a:"Size",b:"Size 2",m:1}] },
  { n:"Baby Wipes (560ct)",cat:"personal-care",br:"johnson-johnson",minP:4.0,maxP:6.0,minS:9.99,maxS:12.99,minSt:20,maxSt:80,unit:"ea" },
  { n:"Baby Shampoo (12oz)",cat:"personal-care",br:"johnson-johnson",minP:2.5,maxP:4.0,minS:5.49,maxS:7.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Baby Lotion (12oz)",cat:"personal-care",br:"johnson-johnson",minP:2.5,maxP:4.0,minS:5.49,maxS:7.99,minSt:15,maxSt:60,unit:"ea" },
  { n:"Baby Powder (12oz)",cat:"personal-care",br:"johnson-johnson",minP:2.0,maxP:3.5,minS:4.99,maxS:6.99,minSt:15,maxSt:60,unit:"ea" },
];

async function seed() {
  const startTime = Date.now();
  console.log("\n\x1b[32mSeed\x1b[0m starting...\n");

  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB\n");

  // Drop existing data
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try { await collections[key].drop(); } catch (_) {}
  }
  console.log("Cleared existing data\n");

  const hashedPassword = await bcrypt.hash(PASSWORD, BCRYPT_SALT_ROUNDS);
  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);

  // -- 1. Super Admin --
  const superAdmin = await User.create({
    name: "System Administrator",
    email: "admin@retailflow.com",
    password: hashedAdminPassword,
    role: "super_admin",
    isActive: true,
    isVerified: true,
    phone: "+1-555-000-0000",
  });
  console.log("+ Super Admin created");

  // -- 2. Businesses --
  const businessData = [
    { name: "FreshMart", slug: "freshmart", email: "info@freshmart.com", phone: "+1-555-111-0000",
address: { street: "100", city: "Accra", state: "Greater Accra", zip: "GA-100", country: "GH" },
      currency: "GHS", timezone: "Africa/Accra", dateFormat: "DD/MM/YYYY",
      subscriptionTier: "professional" as const, subscriptionStatus: "active" as const, storageLimit: 5000,
      settings: { enableMultiCurrency: false, enableLoyalty: true, enableBranches: true, enableSerialTracking: false, enableBatchTracking: true, enableExpiryTracking: true, receiptFooter: "Thank you for shopping at FreshMart!", defaultTax: 8.875 } },
    { name: "CityGrocer", slug: "citygrocer", email: "info@citygrocer.com", phone: "+233-555-222-0000",
      address: { street: "500", city: "Kumasi", state: "Ashanti", zip: "KM", country: "GH" },
      currency: "GHS", timezone: "Africa/Accra", dateFormat: "DD/MM/YYYY",
      subscriptionTier: "enterprise" as const, subscriptionStatus: "active" as const, storageLimit: 20000,
      settings: { enableMultiCurrency: true, enableLoyalty: true, enableBranches: true, enableSerialTracking: true, enableBatchTracking: true, enableExpiryTracking: true, receiptFooter: "Thank you for choosing CityGrocer!", defaultTax: 10.25 } },
  ];
  const businesses = await Business.create(businessData);
  console.log("+ Businesses: FreshMart, CityGrocer");

  // -- 3. Branches --
  const branchNames = ["Main Branch", "Downtown Branch", "Mall Branch"];
  const branchCodes = [["FM-MAIN","CG-MAIN"], ["FM-DT","CG-DT"], ["FM-MALL","CG-MALL"]];
  const branches: any[] = [];
  for (let bi = 0; bi < businesses.length; bi++) {
    for (let ni = 0; ni < branchNames.length; ni++) {
      const loc = pick(CITIES_STATES);
      const b = await Branch.create({
        businessId: businesses[bi]._id, name: branchNames[ni], code: branchCodes[ni][bi],
        address: { street: `${rand(100,9999)} ${pick(STREETS)}`, city: loc.city, state: loc.state, zip: loc.zip, country: "US" },
        phone: `+1-555-${String(rand(100,999)).padStart(3,"0")}-${String(rand(1000,9999))}`,
        email: `${branchNames[ni].toLowerCase().replace(/\s/g,".")}@${businesses[bi].slug}.com`,
        isActive: true,
      });
      branches.push(b);
    }
  }
  console.log("+ 6 Branches created");

  // -- 4. Users --
  interface UserConf { name: string; email: string; role: "business_owner"|"manager"|"cashier"|"inventory_officer"|"accountant"; branchIdx?: number }
  const userConfigs: Record<string, UserConf[]> = {
    freshmart: [
      { name:"John Smith", email:"owner@freshmart.com", role:"business_owner" },
      { name:"Sarah Johnson", email:"manager1@freshmart.com", role:"manager", branchIdx:0 },
      { name:"Mike Wilson", email:"manager2@freshmart.com", role:"manager", branchIdx:1 },
      { name:"Emily Davis", email:"cashier1@freshmart.com", role:"cashier", branchIdx:0 },
      { name:"James Brown", email:"cashier2@freshmart.com", role:"cashier", branchIdx:2 },
      { name:"Robert Garcia", email:"inventory1@freshmart.com", role:"inventory_officer", branchIdx:0 },
      { name:"Lisa Martinez", email:"inventory2@freshmart.com", role:"inventory_officer", branchIdx:1 },
      { name:"David Anderson", email:"accountant@freshmart.com", role:"accountant", branchIdx:0 },
      { name:"Jennifer Taylor", email:"staff1@freshmart.com", role:"cashier", branchIdx:1 },
      { name:"Christopher Thomas", email:"staff2@freshmart.com", role:"cashier", branchIdx:2 },
    ],
    citygrocer: [
      { name:"Maria Rodriguez", email:"owner@citygrocer.com", role:"business_owner" },
      { name:"Daniel Lee", email:"manager1@citygrocer.com", role:"manager", branchIdx:3 },
      { name:"Amy White", email:"manager2@citygrocer.com", role:"manager", branchIdx:4 },
      { name:"Kevin Moore", email:"cashier1@citygrocer.com", role:"cashier", branchIdx:3 },
      { name:"Rachel Green", email:"cashier2@citygrocer.com", role:"cashier", branchIdx:5 },
      { name:"Brian Clark", email:"inventory1@citygrocer.com", role:"inventory_officer", branchIdx:3 },
      { name:"Amanda Hall", email:"inventory2@citygrocer.com", role:"inventory_officer", branchIdx:4 },
      { name:"Steven Wright", email:"accountant@citygrocer.com", role:"accountant", branchIdx:3 },
      { name:"Laura Adams", email:"staff1@citygrocer.com", role:"cashier", branchIdx:4 },
      { name:"Michael Turner", email:"staff2@citygrocer.com", role:"cashier", branchIdx:5 },
    ],
  };
  const bizUsers: Record<string, any[]> = {};
  const bizUserNames: Record<string, {n:string;e:string;r:string}[]> = {};
  for (const biz of businesses) {
    const slug = biz.slug as string;
    const confs = userConfigs[slug];
    const created: any[] = [];
    const names: {n:string;e:string;r:string}[] = [];
    for (const c of confs) {
      const u = await User.create({
        name: c.name, email: c.email, password: hashedPassword,
        role: c.role, businessId: biz._id,
        branchId: c.branchIdx !== undefined ? branches[c.branchIdx]._id : undefined,
        isActive: true, isVerified: true,
        phone: `+1-555-${String(rand(100,999)).padStart(3,"0")}-${String(rand(1000,9999))}`,
      });
      created.push(u);
      names.push({n:c.name, e:c.email, r:c.role});
    }
    bizUsers[biz.slug] = created;
    bizUserNames[biz.slug] = names;
  }
  console.log("+ 21 Users created (1 super admin + 20 business users)");

  // -- 5. Categories --
  const catMap: Record<string, any> = {};
  const subCatMap: Record<string, any> = {};
  for (const biz of businesses) {
    for (const parent of CATEGORY_STRUCTURE) {
      const p = await Category.create({
        businessId: biz._id, name: parent.name, slug: `${biz.slug}-${parent.slug}`,
        description: `${parent.name} category`, isActive: true, sortOrder: 0,
      });
      const key = `${biz.slug}:${parent.slug}`;
      catMap[key] = p;
      if (parent.children) {
        for (let si = 0; si < parent.children.length; si++) {
          const child: { name: string; slug: string } = parent.children[si];
          const c = await Category.create({
            businessId: biz._id, name: child.name, slug: `${biz.slug}-${child.slug}`,
            parentId: p._id, description: `${child.name} subcategory`, isActive: true, sortOrder: si + 1,
          });
          const ckey = `${biz.slug}:${child.slug}`;
          subCatMap[ckey] = c;
        }
      }
    }
  }
  console.log("+ 30 Categories created (15 per business, nested)");

  // -- 6. Brands --
  const brandMap: Record<string, any> = {};
  for (const biz of businesses) {
    for (const b of BRAND_NAMES) {
      const brand = await Brand.create({
        businessId: biz._id, name: b.name, slug: `${biz.slug}-${b.slug}`,
        description: `${b.name} brand`, isActive: true,
      });
      brandMap[`${biz.slug}:${b.slug}`] = brand;
    }
  }
  console.log("+ 50 Brands created (25 per business)");

  // -- 7. Suppliers --
  const supplierMap: Record<string, any[]> = {};
  for (const biz of businesses) {
    const bizSuppliers: any[] = [];
    for (let i = 0; i < 30; i++) {
      const company = SUPPLIER_COMPANIES[i];
      const loc = pick(CITIES_STATES);
      const s = await Supplier.create({
        businessId: biz._id, name: company,
        company, email: `info@${company.toLowerCase().replace(/[^a-z0-9]/g,"")}.com`,
        phone: `+1-555-${String(rand(100,999)).padStart(3,"0")}-${String(rand(1000,9999))}`,
        address: `${rand(100,9999)} ${pick(STREETS)}, ${loc.city}, ${loc.state} ${loc.zip}`,
        taxId: `TAX-${String(rand(10000,99999))}`,
        paymentTerms: pick(["Net 30","Net 60","Net 15","Due on Receipt"]),
        outstandingBalance: rand(0, 5000),
        isActive: true,
      });
      bizSuppliers.push(s);
    }
    supplierMap[biz.slug] = bizSuppliers;
  }
  console.log("+ 60 Suppliers created (30 per business)");

  // -- 8. Products --
  const productMap: Record<string, any[]> = {};
  let totalProducts = 0;
  for (const biz of businesses) {
    const bizProducts: any[] = [];
    let idx = 0;
    for (const t of PROD_TEMPLATES) {
      const catKey = `${biz.slug}:${t.cat}`;
      const brandKey = `${biz.slug}:${t.br}`;
      const cat = subCatMap[catKey] || catMap[catKey];
      const brand = brandMap[brandKey];
      const supplier = pick(supplierMap[biz.slug]);
      if (!cat) continue;
      idx++;
      const purchasePrice = randFloat(t.minP, t.maxP);
      const sellingPrice = randFloat(t.minS, t.maxS);
      const wholesalePrice = +(sellingPrice * 0.85).toFixed(2);
      const stock = rand(t.minSt || 10, t.maxSt || 100);
      const minStock = rand(5, Math.max(10, Math.floor(stock * 0.2)));
      const maxStock = rand(stock + 10, stock + 100);
      const sku = generateSKU(t.cat.toUpperCase().slice(0,3), idx);
      const barcode = generateBarcode();
      const batchNum = t.bat ? `BATCH-${String(rand(1000,9999))}` : undefined;
      const expDate = t.exp ? new Date(Date.now() + rand(7, 180) * 86400000) : undefined;
      const imgUrl = `https://res.cloudinary.com/demo/image/upload/v1/retailflow/products/${t.n.toLowerCase().replace(/[^a-z0-9]+/g,"-")}.jpg`;
      const isArchived = Math.random() < 0.08;
      const branch = pick(branches.filter(b => b.businessId.toString() === biz._id.toString()));
      const trackBatch = t.bat || false;
      const trackExpiry = t.exp || false;
      const trackSerial = t.br === "samsung" || t.br === "apple" || t.br === "sony";
      const variants = t.vars?.map(v => ({
        name: v.a, value: v.b,
        price: +(sellingPrice * v.m).toFixed(2),
        stock: rand(5, 50),
        sku: `${sku}-${v.b.toUpperCase().slice(0,3)}`,
      })) || [];

      const prod = await Product.create({
        businessId: biz._id, branchId: branch._id,
        name: t.n, sku, barcode, categoryId: cat._id, brandId: brand?._id, supplierId: supplier._id,
        description: `High-quality ${t.n.toLowerCase()} for retail sale.`,
        purchasePrice, sellingPrice, wholesalePrice,
        minStock, maxStock, currentStock: stock,
        warehouse: pick(["A","B","C","D"]), shelf: `Shelf-${rand(1,20)}`,
        expiryDate: expDate, batchNumber: batchNum,
        tax: biz.slug === "freshmart" ? 8.875 : 10.25,
        unit: t.unit || "ea",
        images: [imgUrl],
        variants,
        isActive: true, isArchived,
        trackSerial, trackBatch, trackExpiry,
      });
      bizProducts.push(prod);
      totalProducts++;
    }
    productMap[biz.slug] = bizProducts;
  }
  console.log(`+ ${totalProducts} Products created`);

  // -- 9. Customers --
  const customerMap: Record<string, any[]> = {};
  for (const biz of businesses) {
    const bizCusts: any[] = [];
    const numCusts = 250;
    for (let i = 0; i < numCusts; i++) {
      const fname = pick(FIRST_NAMES);
      const lname = pick(LAST_NAMES);
      const loc = pick(CITIES_STATES);
      const c = await Customer.create({
        businessId: biz._id, name: `${fname} ${lname}`,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}${i}@email.com`,
        phone: `+1-555-${String(rand(100,999)).padStart(3,"0")}-${String(rand(1000,9999))}`,
        address: `${rand(100,9999)} ${pick(STREETS)}, ${loc.city}, ${loc.state} ${loc.zip}`,
        loyaltyPoints: rand(0, 1000), totalPurchases: rand(0, 50), balance: 0,
        creditLimit: rand(0, 5000), isActive: true,
      });
      bizCusts.push(c);
    }
    customerMap[biz.slug] = bizCusts;
  }
  console.log("+ 500 Customers created (250 per business)");

  // -- 10. Sales --
  let totalSales = 0, totalSaleItems = 0;
  for (const biz of businesses) {
    const slug = biz.slug as string;
    const bizProds = productMap[slug];
    const bizCusts = customerMap[slug];
    const bizUserList = bizUsers[slug];
    const cashiers = bizUserList.filter(u => u.role === "cashier");
    const managers = bizUserList.filter(u => u.role === "manager");
    const numSales = 500;
    for (let i = 0; i < numSales; i++) {
      const saleDate = randomDate(90);
      const numItems = rand(1, 15);
      const selectedProds = pickN(bizProds, numItems);
      const user = pick([...cashiers, ...managers]);
      const branch = pick(branches.filter(b => b.businessId.toString() === biz._id.toString()));
      const customer = Math.random() < 0.7 ? pick(bizCusts) : undefined;
      const paymentMethod = pick([...PAYMENT_METHODS]) as string;
      const status = pick(SALE_STATUSES) as "completed"|"refunded"|"cancelled";

      const items: any[] = [];
      let subtotal = 0, taxTotal = 0, discountTotal = 0;
      for (const prod of selectedProds) {
        const qty = rand(1, 5);
        const price = prod.variants?.length ? prod.variants[0].price : prod.sellingPrice;
        const cost = prod.purchasePrice;
        const discount = Math.random() < 0.15 ? +(price * randFloat(0.05, 0.2)).toFixed(2) : 0;
        const tax = prod.tax || 0;
        const lineTotal = +((price - discount) * qty).toFixed(2);
        items.push({ productId: prod._id, name: prod.name, sku: prod.sku, quantity: qty, price, cost, discount, tax, total: lineTotal });
        subtotal += price * qty;
        taxTotal += +(lineTotal * (tax / 100)).toFixed(2);
        discountTotal += discount * qty;
      }
      const grandTotal = +((subtotal - discountTotal) + taxTotal).toFixed(2);

      const invNum = `${slug === "freshmart" ? "FM" : "CG"}-${String(saleDate.getFullYear())}${String(saleDate.getMonth()+1).padStart(2,"0")}${String(saleDate.getDate()).padStart(2,"0")}-${String(i+1).padStart(5,"0")}`;

      const sale = await Sale.create({
        businessId: biz._id, branchId: branch._id, userId: user._id,
        customerId: customer?._id, invoiceNumber: invNum,
        items: items.map(item => ({ ...item, total: item.price * item.quantity - (item.discount * item.quantity) })),
        subtotal: +subtotal.toFixed(2), discountTotal: +discountTotal.toFixed(2), taxTotal: +taxTotal.toFixed(2), grandTotal,
        paymentMethod,
        paymentDetails: { cash: paymentMethod === "cash" || paymentMethod === "mixed" ? grandTotal : 0, card: paymentMethod === "card" ? grandTotal : 0, mobileMoney: paymentMethod === "mobile_money" ? grandTotal : 0, change: 0 },
        status, notes: status === "cancelled" ? "Customer cancelled order" : status === "refunded" ? "Refund processed" : undefined,
        createdAt: saleDate, updatedAt: saleDate,
      });

      // Create SaleItems
      const saleItemDocs = items.map(item => ({
        businessId: biz._id, saleId: sale._id, productId: item.productId,
        name: item.name, sku: item.sku, quantity: item.quantity,
        price: item.price, cost: item.cost, discount: item.discount,
        tax: item.tax, total: item.quantity * item.price - item.discount * item.quantity,
        profit: (item.price - item.cost - item.discount) * item.quantity,
      }));
      await SaleItem.insertMany(saleItemDocs);
      totalSaleItems += saleItemDocs.length;
      totalSales++;
    }
  }
  console.log(`+ ${totalSales} Sales created with ${totalSaleItems} SaleItems`);

  // -- 11. Purchase Orders --
  let totalPOs = 0, totalPOLineItems = 0;
  for (const biz of businesses) {
    const slug = biz.slug as string;
    const bizProds = productMap[slug];
    const bizSupps = supplierMap[slug];
    const bizUserList = bizUsers[slug];
    const invOfficers = bizUserList.filter(u => u.role === "inventory_officer" || u.role === "manager");
    const accts = bizUserList.filter(u => u.role === "accountant");
    const numPOs = 125;
    for (let i = 0; i < numPOs; i++) {
      const poDate = randomDate(60);
      const numItems = rand(5, 20);
      const selectedProds = pickN(bizProds, numItems);
      const user = pick([...invOfficers, ...accts]);
      const supplier = pick(bizSupps);
      const status = pick(PO_STATUSES) as "pending"|"approved"|"received"|"partial"|"cancelled";
      const branch = pick(branches.filter(b => b.businessId.toString() === biz._id.toString()));

      const items: any[] = [];
      let subtotal = 0;
      for (const prod of selectedProds) {
        const qty = rand(10, 200);
        const price = +(prod.purchasePrice * randFloat(0.95, 1.1)).toFixed(2);
        const received = status === "received" ? qty : status === "partial" ? rand(1, qty - 1) : 0;
        const total = +(price * qty).toFixed(2);
        items.push({ productId: prod._id, name: prod.name, sku: prod.sku, quantity: qty, received, price, total });
        subtotal += price * qty;
      }
      const taxTotal = +(subtotal * 0.07).toFixed(2);
      const grandTotal = +(subtotal + taxTotal).toFixed(2);
      const poNum = `PO-${slug.toUpperCase().slice(0,3)}-${String(i+1).padStart(5,"0")}`;

      await PurchaseOrder.create({
        businessId: biz._id, branchId: branch._id, supplierId: supplier._id, userId: user._id,
        poNumber: poNum, items, subtotal: +subtotal.toFixed(2), taxTotal, grandTotal,
        status, notes: status === "cancelled" ? "Order cancelled by management" : undefined,
        receivedAt: status === "received" ? poDate : undefined,
        createdAt: poDate, updatedAt: poDate,
      });
      totalPOLineItems += items.length;
      totalPOs++;
    }
  }
  console.log(`+ ${totalPOs} Purchase Orders created with ${totalPOLineItems} line items`);

  // -- 12. Inventory Movements --
  let totalMovements = 0;
  for (const biz of businesses) {
    const slug = biz.slug as string;
    const bizProds = productMap[slug];
    const bizUserList = bizUsers[slug];
    const invOfficers = bizUserList.filter(u => u.role === "inventory_officer" || u.role === "manager");
    const bizBranches = branches.filter(b => b.businessId.toString() === biz._id.toString());
    const numMovements = 300;
    const movDocs: any[] = [];
    for (let i = 0; i < numMovements; i++) {
      const prod = pick(bizProds);
      const user = pick(invOfficers);
      const branch = pick(bizBranches);
      const type = pick(MOVEMENT_TYPES) as string;
      const qty = type === "adjustment" ? rand(-20, 20) : rand(1, 100);
      const reference = type === "stock_in" ? `PO-${slug.toUpperCase().slice(0,3)}-${String(rand(1,999)).padStart(5,"0")}` : type === "stock_out" ? `SALE-${String(rand(1,999)).padStart(5,"0")}` : undefined;
      const toBranch = type === "transfer" ? pick(bizBranches.filter(b => b._id.toString() !== branch._id.toString())) : undefined;
      movDocs.push({
        businessId: biz._id, branchId: branch._id, productId: prod._id, userId: user._id,
        type, quantity: qty, reference, notes: `${type} movement for ${prod.name}`,
        batchNumber: prod.batchNumber, toBranchId: toBranch?._id,
      });
    }
    await InventoryMovement.insertMany(movDocs);
    totalMovements += movDocs.length;
  }
  console.log(`+ ${totalMovements} Inventory Movements created`);

  // -- 13. Expense Categories --
  const expCatMap: Record<string, any[]> = {};
  for (const biz of businesses) {
    const cats: any[] = [];
    for (const name of EXPENSE_CATEGORY_NAMES) {
      const ec = await ExpenseCategoryModel.create({
        businessId: biz._id, name, description: `${name} expenses`,
        budget: rand(500, 50000), isActive: true,
      });
      cats.push(ec);
    }
    expCatMap[biz.slug] = cats;
  }
  console.log("+ 30 Expense Categories created (15 per business)");

  // -- 14. Expenses --
  let totalExpenses = 0;
  for (const biz of businesses) {
    const slug = biz.slug as string;
    const bizCats = expCatMap[slug];
    const bizUserList = bizUsers[slug];
    const accts = bizUserList.filter(u => u.role === "accountant" || u.role === "manager" || u.role === "business_owner");
    const bizBranches = branches.filter(b => b.businessId.toString() === biz._id.toString());
    const expDocs: any[] = [];
    const numExps = 150;
    for (let i = 0; i < numExps; i++) {
      const cat = pick(bizCats);
      const user = pick(accts);
      const branch = pick(bizBranches);
      const amount = randFloat(5, 5000);
      const expDate = randomDate(90);
      const paymentMethods = ["cash", "card", "bank_transfer", "check"];
      expDocs.push({
        businessId: biz._id, branchId: branch._id, categoryId: cat._id, userId: user._id,
        amount, description: `${cat.name} expense - ${pick(["Monthly","Weekly","Annual","One-time"])} payment`,
        date: expDate, isRecurring: Math.random() < 0.2,
        recurringInterval: Math.random() < 0.2 ? pick(["monthly", "weekly", "yearly"] as const) : undefined,
        paymentMethod: pick(paymentMethods),
      });
    }
    await Expense.insertMany(expDocs);
    totalExpenses += expDocs.length;
  }
  console.log(`+ ${totalExpenses} Expenses created`);

  // -- 15. Coupons --
  let totalCoupons = 0;
  for (const biz of businesses) {
    const couponDocs: any[] = [];
    for (let i = 0; i < 50; i++) {
      const type = pick(["percentage", "fixed"] as const);
      const value = type === "percentage" ? rand(5, 50) : randFloat(2, 20);
      const code = `${pick(["SAVE","DISCOUNT","OFFER","DEAL","PROMO"])}${rand(10,99)}${pick(["A","B","C","D","E"])}`;
      couponDocs.push({
        businessId: biz._id, code, type, value,
        minPurchase: Math.random() < 0.5 ? randFloat(10, 100) : 0,
        maxUses: Math.random() < 0.5 ? rand(50, 1000) : undefined,
        uses: rand(0, 30), startsAt: randomDate(30),
        expiresAt: new Date(Date.now() + rand(30, 365) * 86400000),
        isActive: Math.random() < 0.8,
      });
    }
    await Coupon.insertMany(couponDocs);
    totalCoupons += couponDocs.length;
  }
  console.log(`+ ${totalCoupons} Coupons created`);

  // -- 16. Receipts --
  let totalReceipts = 0;
  for (const biz of businesses) {
    const slug = biz.slug as string;
    const bizSales = await Sale.find({ businessId: biz._id }).limit(300);
    const bizBranches = branches.filter(b => b.businessId.toString() === biz._id.toString());
    const rcpts: any[] = [];
    for (let i = 0; i < bizSales.length && i < 300; i++) {
      const s = bizSales[i];
      const branch = pick(bizBranches);
      const rcpNum = `RCP-${slug.toUpperCase().slice(0,3)}-${String(i+1).padStart(6,"0")}`;
      rcpts.push({
        businessId: biz._id, branchId: branch._id, saleId: s._id, receiptNumber: rcpNum,
        customerName: s.customerId ? "Valued Customer" : undefined,
        items: s.items.map((it: any) => ({ name: it.name, quantity: it.quantity, price: it.price, total: it.quantity * it.price })),
        subtotal: s.subtotal, tax: s.taxTotal, discount: s.discountTotal, grandTotal: s.grandTotal,
        paymentMethod: s.paymentMethod,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=receipt:${rcpNum}`,
        publicUrl: `https://receipts.retailflow.com/${slug}/${rcpNum}`,
        createdAt: s.createdAt, updatedAt: s.createdAt,
      });
    }
    await Receipt.insertMany(rcpts);
    totalReceipts += rcpts.length;
  }
  console.log(`+ ${totalReceipts} Receipts created`);

  // -- 17. Notifications --
  let totalNotifs = 0;
  for (const biz of businesses) {
    const bizUserList = bizUsers[biz.slug];
    const notifTypes = ["stock_alert", "sale_completed", "payment_received", "order_received", "system"];
    const notifDocs: any[] = [];
    for (const user of bizUserList) {
      for (let i = 0; i < 5; i++) {
        const notifType = pick(notifTypes);
        notifDocs.push({
          businessId: biz._id, userId: user._id, type: notifType,
          title: pick(["Low Stock Alert","New Sale Completed","Payment Received","Order Delivered","System Update"]),
          message: pick(["Inventory level is running low for several products.","A new sale has been processed successfully.","Payment of $X has been received.","Purchase order has been delivered and received.","System maintenance scheduled for tonight."]),
          read: Math.random() < 0.4, sentAt: randomDate(30),
          link: Math.random() < 0.5 ? `/${notifType}` : undefined,
        });
      }
    }
    await Notification.insertMany(notifDocs);
    totalNotifs += notifDocs.length;
  }
  console.log(`+ ${totalNotifs} Notifications created`);

  // -- 18. Audit Logs --
  let totalAuditLogs = 0;
  for (const biz of businesses) {
    const bizUserList = bizUsers[biz.slug];
    const actions = ["create", "update", "delete", "login", "logout", "export", "print"];
    const resources = ["sale", "product", "customer", "purchase_order", "user", "report", "settings"];
    const auditDocs: any[] = [];
    for (let i = 0; i < 100; i++) {
      const user = pick(bizUserList);
      const action = pick(actions);
      const resource = pick(resources);
      auditDocs.push({
        businessId: biz._id, userId: user._id, action, resource,
        resourceId: new mongoose.Types.ObjectId().toString(),
        details: { description: `${action} ${resource}`, timestamp: new Date().toISOString() },
        ip: `192.168.${rand(1,255)}.${rand(1,255)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      });
    }
    await AuditLog.insertMany(auditDocs);
    totalAuditLogs += auditDocs.length;
  }
  console.log(`+ ${totalAuditLogs} Audit Logs created`);

  // -- 19. Taxes --
  let totalTaxes = 0;
  for (const biz of businesses) {
    const taxRates = [
      { name: "Sales Tax", rate: biz.slug === "freshmart" ? 8.875 : 10.25, isDefault: true },
      { name: "VAT", rate: 5.0, isDefault: false },
      { name: "Service Tax", rate: 3.0, isDefault: false },
    ];
    for (const t of taxRates) {
      await Tax.create({ businessId: biz._id, name: t.name, rate: t.rate, type: "exclusive", isDefault: t.isDefault, isActive: true });
      totalTaxes++;
    }
  }
  console.log(`+ ${totalTaxes} Tax configurations created`);

  // -- 20. Subscriptions --
  for (const biz of businesses) {
    const tier = biz.subscriptionTier;
    const features: Record<string, any> = {
      maxUsers: tier === "enterprise" ? 100 : tier === "professional" ? 25 : 5,
      maxBranches: tier === "enterprise" ? 20 : tier === "professional" ? 5 : 1,
      maxStorage: tier === "enterprise" ? 20000 : tier === "professional" ? 5000 : 500,
      analytics: tier !== "free", apiAccess: tier === "enterprise",
      prioritySupport: tier === "enterprise",
    };
    await Subscription.create({
      businessId: biz._id, tier, status: "active",
      startDate: daysAgo(rand(30, 180)), endDate: new Date(Date.now() + rand(30, 365) * 86400000),
      amount: tier === "enterprise" ? 299.99 : tier === "professional" ? 99.99 : 0,
      paymentId: `pi_${new mongoose.Types.ObjectId().toString().slice(0, 24)}`,
      features, maxUsers: features.maxUsers, maxStorage: features.maxStorage, maxBranches: features.maxBranches,
    });
  }
  console.log("+ 2 Subscriptions created");

  // -- 21. Payments --
  let totalPayments = 0;
  for (const biz of businesses) {
    const sub = await Subscription.findOne({ businessId: biz._id });
    if (sub) {
      for (let i = 0; i < 6; i++) {
        const payDate = daysAgo(i * 30);
        await Payment.create({
          businessId: biz._id, subscriptionId: sub._id,
          amount: sub.amount || 0, currency: "GHS",
          method: pick(["card", "bank_transfer", "paypal"]),
          status: pick(["completed", "completed", "completed", "completed", "pending", "failed"] as const),
          transactionId: `txn_${new mongoose.Types.ObjectId().toString().slice(0, 20)}`,
          paidAt: payDate, createdAt: payDate,
        });
        totalPayments++;
      }
    }
  }
  console.log(`+ ${totalPayments} Payments created`);

  // -- 22. Sessions --
  let totalSessions = 0;
  for (const biz of businesses) {
    const bizUserList = bizUsers[biz.slug];
    for (const user of bizUserList) {
      await Session.create({
        userId: user._id, businessId: biz._id,
        token: `sess_${new mongoose.Types.ObjectId().toString()}`,
        ip: `192.168.${rand(1,255)}.${rand(1,255)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        expiresAt: new Date(Date.now() + 86400000), isValid: Math.random() < 0.8,
      });
      totalSessions++;
    }
  }
  console.log(`+ ${totalSessions} Sessions created`);

  // -- 23. Images --
  let totalImages = 0;
  for (const biz of businesses) {
    const imgDocs: any[] = [];
    for (let i = 0; i < 20; i++) {
      imgDocs.push({
        businessId: biz._id,
        url: `https://res.cloudinary.com/demo/image/upload/v1/retailflow/products/image_${i}.jpg`,
        publicId: `retailflow/products/image_${i}`,
        format: "jpg", width: rand(200, 800), height: rand(200, 800),
        bytes: rand(10000, 500000), isThumbnail: Math.random() < 0.3,
      });
    }
    await ImageModel.insertMany(imgDocs);
    totalImages += imgDocs.length;
  }
  console.log(`+ ${totalImages} Images created`);

  // -- Summary --
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("\n" + "=".repeat(60));
  console.log("== SEED SUMMARY ==");
  console.log("=".repeat(60));
  const summaryRows = [
    ["Super Admins", "1"],
    ["Businesses", "2 (FreshMart, CityGrocer)"],
    ["Branches", "6"],
    ["Users", `21 (1 super admin + 20 business users)`],
    ["Categories", "30 (5 parent + 10 child per business)"],
    ["Brands", "50 (25 per business)"],
    ["Suppliers", "60 (30 per business)"],
    ["Products", String(totalProducts)],
    ["Customers", "500 (250 per business)"],
    ["Sales", String(totalSales)],
    ["Sale Items", String(totalSaleItems)],
    ["Purchase Orders", String(totalPOs)],
    ["PO Line Items", String(totalPOLineItems)],
    ["Inventory Movements", String(totalMovements)],
    ["Expense Categories", "30 (15 per business)"],
    ["Expenses", String(totalExpenses)],
    ["Coupons", String(totalCoupons)],
    ["Receipts", String(totalReceipts)],
    ["Notifications", String(totalNotifs)],
    ["Audit Logs", String(totalAuditLogs)],
    ["Tax Configs", String(totalTaxes)],
    ["Subscriptions", "2"],
    ["Payments", String(totalPayments)],
    ["Sessions", String(totalSessions)],
    ["Images", String(totalImages)],
  ];
  for (const [label, count] of summaryRows) {
    console.log(`  ${label.padEnd(25)} ${count}`);
  }
  console.log("-".repeat(60));
  console.log(`  ${"Total Time".padEnd(25)} ${elapsed}s`);
  console.log("=".repeat(60));

  // -- Demo Credentials --
  console.log("\n\x1b[1mDEMO LOGIN CREDENTIALS\x1b[0m");
  console.log("=".repeat(60));
  const line = "\u2500".repeat(58);
  console.log("\u250c" + line + "\u2510");
  console.log("\u2502 " + "Role / Business".padEnd(20) + " \u2502 " + "Email".padEnd(25) + " \u2502 " + "Password".padEnd(14) + " \u2502");
  console.log("\u251c" + line + "\u2524");
  console.log("\u2502 " + "Super Admin".padEnd(20) + " \u2502 " + "admin@retailflow.com".padEnd(25) + " \u2502 " + ADMIN_PASSWORD.padEnd(14) + " \u2502");
  console.log("\u251c" + line + "\u2524");
  for (const biz of businesses) {
    const slug = biz.slug as string;
    const users = bizUserNames[slug] || [];
    for (const u of users) {
      const roleLabel = `${slug === "freshmart" ? "FreshMart" : "CityGrocer"} ${u.r.charAt(0).toUpperCase() + u.r.slice(1).replace(/_/g," ")}`;
      console.log("\u2502 " + roleLabel.padEnd(20) + " \u2502 " + u.e.padEnd(25) + " \u2502 " + PASSWORD.padEnd(14) + " \u2502");
    }
    if (businesses.indexOf(biz) < businesses.length - 1) console.log("\u251c" + line + "\u2524");
  }
  console.log("\u2514" + line + "\u2518");
  console.log("\nSeed completed successfully!\n");
}
seed().catch((err) => {
  console.error("\nERROR Seed failed:", err);
  process.exit(1);
});
