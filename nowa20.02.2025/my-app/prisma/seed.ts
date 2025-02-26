import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Definiujemy uprawnienia bezpośrednio w pliku seed
// To są te same uprawnienia, ale bez odniesień do ikon z lucide-react
const SEED_PERMISSIONS = [
  {
    name: "Dashboard",
    href: "/workspace/dashboard",
    description: "Dostęp do panelu głównego"
  },
  {
    name: "Harmonogram",
    href: "/workspace/harmonogram",
    description: "Dostęp do modułu Harmonogram"
  },
  {
    name: "Kontrola Jakości",
    href: "/workspace/kontrola-jakosci",
    description: "Dostęp do modułu Kontrola Jakości"
  },
  {
    name: "Obsluga Zamowien",
    href: "/workspace/obsluz-zamowienia",
    description: "Dostęp do modułu Obsluga Zamowien"
  },
  {
    name: "Przyjecia Dostawy",
    href: "/workspace/przyjecia-dostawy",
    description: "Dostęp do modułu Przyjecia Dostawy"
  },
  {
    name: "Wykres",
    href: "/workspace/wykres",
    description: "Dostęp do modułu Wykres"
  },
  {
    name: "Zdarzenia",
    href: "/workspace/zdarzenia",
    description: "Dostęp do modułu Zdarzenia"
  },
  {
    name: "Pracownicy",
    href: "/workspace/pracownicy",
    description: "Dostęp do modułu Pracownicy"
  },
  {
    name: "Magazyny",
    href: "/workspace/magazyny",
    description: "Dostęp do modułu Magazyny"
  },
  {
    name: "Dostawcy",
    href: "/workspace/dostawcy",
    description: "Dostęp do modułu Dostawcy"
  },
  {
    name: "Odbiorcy",
    href: "/workspace/odbiorcy",
    description: "Dostęp do modułu Odbiorcy"
  },
  {
    name: "Produkty",
    href: "/workspace/produkty",
    description: "Dostęp do modułu Produkty"
  },
  {
    name: "Frakcje",
    href: "/workspace/frakcje",
    description: "Dostęp do modułu Frakcje"
  }
];

async function main() {
  // =====================================================
  // Czyszczenie CAŁEJ bazy - usuwamy kompletnie wszystkie dane
  // =====================================================
  console.log("🧹 Czyszczenie bazy danych...");
  
  // 1. Najpierw usuwamy tabele z relacjami/kluczami obcymi
  await prisma.statusChange.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.productionBatch.deleteMany({}); 
  
  // 2. Usuwanie powiązań użytkowników z uprawnieniami 
  // (tabela łącząca może nie być dostępna bezpośrednio, ale usunięcie użytkowników ją wyczyści)
  await prisma.permission.deleteMany({});
  await prisma.user.deleteMany({});
  
  // 3. Pozostałe tabele
  await prisma.fraction.deleteMany({});
  await prisma.batchStatus.deleteMany({});
  await prisma.recipient.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.machine.deleteMany({});
  
  console.log("✅ Baza danych wyczyszczona!");

  // =====================================================
  // SEED: Administrator oraz jego uprawnienia
  // =====================================================
  // Tworzymy administratora – użytkownika z rolą admina – z zaszyfrowanym hasłem
  const plainPassword = "admin123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.create({
    data: {
      login: "admin",
      password: hashedPassword,
      username: "Administrator",
      userSurname: "System"
    },
  });

  // Przypisujemy do administratora uprawnienia, używając lokalnej definicji
  for (const permConfig of SEED_PERMISSIONS) {
    await prisma.permission.create({
      data: {
        name: permConfig.name,
        href: permConfig.href,
        description: permConfig.description,
        users: {
          connect: { id: admin.id }
        }
      }
    });
  }

  // =====================================================
  // SEED: Dodatkowy użytkownik z wybranymi uprawnieniami
  // =====================================================
  // Wybieramy konkretne uprawnienia, które chcemy przypisać zwykłemu użytkownikowi
  const selectedPermissionNames = ["Dashboard", "Harmonogram", "Kontrola Jakości", "Produkty"];

  const selectedPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: selectedPermissionNames
      }
    }
  });

  const plainUserPassword = "user123";
  const hashedUserPassword = await bcrypt.hash(plainUserPassword, 10);

  const normalUser = await prisma.user.create({
    data: {
      login: "user",
      password: hashedUserPassword,
      username: "Jan",
      userSurname: "Kowalski",
      permissions: {
        connect: selectedPermissions.map(permission => ({ id: permission.id })),
      },
    },
  });

  // =====================================================
  // SEED: Odbiorcy (Recipients)
  // =====================================================
  await seedRecipients();

  // =====================================================
  // SEED: Dostawcy (Suppliers)
  // =====================================================
  await seedSuppliers();

  // =====================================================
  // SEED: Produkty (Products)
  // =====================================================
  await seedProducts();

  // =====================================================
  // SEED: Maszyny (Machines)
  // =====================================================
  await seedMachines();

  // =====================================================
  // SEED: Statusy partii produkcyjnych (BatchStatus)
  // =====================================================
  await prisma.batchStatus.deleteMany({});

  const batchStatuses = [
    { name: "Przyjęty", description: "Materiał został przyjęty do zakładu", color: "#4CAF50" },
    { name: "W mroźni", description: "Materiał znajduje się w mroźni", color: "#2196F3" },
    { name: "W liofilizacji", description: "Materiał jest w trakcie procesu liofilizacji", color: "#FF9800" },
    { name: "Półprodukt", description: "Zliofilizowany produkt czeka na dalsze przetworzenie", color: "#9C27B0" },
    { name: "Kontrola jakości", description: "Produkt w trakcie kontroli jakości", color: "#FFC107" },
    { name: "Gotowy produkt", description: "Produkt gotowy do wydania", color: "#00BCD4" }
  ];

  for (const status of batchStatuses) {
    await prisma.batchStatus.create({
      data: status
    });
  }
  console.log("Batch statuses seeded.");

  // =====================================================
  // SEED: Frakcje produktów (Fraction)
  // =====================================================
  await prisma.fraction.deleteMany({});

  const fractions = [
    { name: "Cały owoc", description: "Produkt w całości, bez cięcia" },
    { name: "Grys", description: "Produkt rozdrobniony na drobne kawałki" },
    { name: "Kostka", description: "Produkt pokrojony w kostki" },
    { name: "Plaster", description: "Produkt pokrojony w plastry" },
    { name: "1/2 plastra", description: "Produkt pokrojony w połówki plastrów" },
    { name: "1/4 plastra", description: "Produkt pokrojony w ćwiartki plastrów" },
    { name: "Proszek", description: "Produkt zmielony na proszek" },
    { name: "Segmenty", description: "Produkt podzielony na naturalne segmenty" }
  ];

  for (const fraction of fractions) {
    await prisma.fraction.create({
      data: fraction
    });
  }
  console.log("Fractions seeded.");

  console.log("Database has been seeded! 🌱");
}

//*************************************************************************************** 
// SEED: Odbiorcy (Recipients)
//*************************************************************************************** 
// Definicja interfejsu dla danych seed dla odbiorców
interface RecipientSeed {
  name: string;
}

// Tablica z przykładowymi danymi odbiorców
const recipientSeedData: RecipientSeed[] = [
  { name: 'Brak' },
  { name: 'Inventia' },
  { name: 'Husarich' },
  { name: 'PG' },
  { name: 'Bestlife' },
  { name: 'Bakaliowe smaki' },
];

// Funkcja seed, która zapisuje dane odbiorców do bazy
async function seedRecipients() {
  for (const recipient of recipientSeedData) {
    await prisma.recipient.create({
      data: {
        name: recipient.name,
      },
    });
  }
  console.log("Recipients seeded.");
}

//*************************************************************************************** 
// SEED: Dostawcy (Suppliers)
//*************************************************************************************** 
// Definicja interfejsu dla danych seed dla dostawców
interface SupplierSeed {
  name: string;
}

// Tablica z przykładowymi danymi dostawców
const supplierSeedData: SupplierSeed[] = [
  { name: "Dujardin" },
  { name: "Inventia" },
  { name: "Daregal" },
  { name: "Herbafrost" },
  { name: "Bestlife" },
  { name: "Indie" },
  { name: "Agroquiskay" },
  { name: "Allium Sp.z o.o." },
  { name: "Cytrus" },
  { name: "Agroquiskay" },
  { name: "Peru" },
  { name: "Kujawskie Zioła" },
  { name: "Nordfrost" },
  { name: "Ekwador" },
  { name: "Run" },
  { name: "Unifreeze" },
  { name: "Cajdex" },
  { name: "CK Frost" },
  { name: "Oerlemans" },
  { name: "Greek Trade" },
  { name: "GR Szymczak" },
  { name: "Handsman" },
  { name: "Zdrovo" },
  { name: "Mager" },
  { name: "Kaufland" },
  { name: "Klar" },
];

// Funkcja seed, która zapisuje dane dostawców do bazy
async function seedSuppliers() {
  for (const supplier of supplierSeedData) {
    await prisma.supplier.create({
      data: {
        name: supplier.name,
      },
    });
  }
  console.log("Suppliers seeded.");
}

//*************************************************************************************** 
// SEED: Produkty (Products)
//*************************************************************************************** 
// Definicja interfejsu dla danych seed dla produktów
interface ProductSeed {
  name: string;
}

// Tablica z przykładowymi danymi produktów
const productSeedData: ProductSeed[] = [
  { name: "Ananas" },
  { name: "Aronia" },
  { name: "Banan" },
  { name: "Bazylia" },
  { name: "Brokuły" },
  { name: "Cebula Kostka" },
  { name: "Cytryna" },
  { name: "Cząber" },
  { name: "Czosnek" },
  { name: "Czosnek niedźwiedzi" },
  { name: "Estragon" },
  { name: "Grejpfrut" },
  { name: "Jabłko" },
  { name: "Kalafior grys" },
  { name: "Kolagen" },
  { name: "Kolendra" },
  { name: "Koper" },
  { name: "Liście limonki" },
  { name: "Lubczyk" },
  { name: "Majeranek" },
  { name: "Malina" },
  { name: "Malina cała" },
  { name: "Mandarynka" },
  { name: "Mięta" },
  { name: "Oregano" },
  { name: "Pietruszka 1-3" },
  { name: "Pietruszka 4-8" },
  { name: "Pomarańcza" },
  { name: "Rokitnik" },
  { name: "Rozmaryn" },
  { name: "Rzeżucha" },
  { name: "Surowiec" },
  { name: "Szałwia" },
  { name: "Szczypiorek" },
  { name: "Trawa cytrynowa" },
  { name: "Truskawka" },
  { name: "Trybula" },
  { name: "Tymianek" },
  { name: "Kurka" },
  { name: "Jeżyna" },
  { name: "Malina grys" },
  { name: "Truskawka plastry" },
  { name: "Wiśnia" },
  { name: "Limonka" },
  { name: "Cukinia" },
  { name: "Wiśnia cała" },
  { name: "Marchew" },
  { name: "Jabłko kostka" },
  { name: "Brzoskwinia kostka" },
  { name: "Gruszka kostka" },
  { name: "Kiwi kostka" },
  { name: "Mango kostka" },
  { name: "Morela kostka" },
  { name: "Śliwka poł." },
  { name: "Ananas kawałki" },
  { name: "Banan plastry" },
  { name: "Marchew plastry" },
  { name: "Kiwi plastry" },
  { name: "Truskawka kostka" },
  { name: "Wiśnia Połówki" },
  { name: "Morela połówki" },
  { name: "Mięta pieprzowa" },
  { name: "Rokitnik" },
  { name: "Brzoskwinia" },
];

// Funkcja seed, która zapisuje dane produktów do bazy
async function seedProducts() {
  for (const product of productSeedData) {
    await prisma.product.create({
      data: {
        name: product.name,
      },
    });
  }
  console.log("Products seeded.");
}

//*************************************************************************************** 
// SEED: Maszyny (Machines)
//*************************************************************************************** 
// Definicja interfejsu dla danych seed dla maszyn
interface MachineSeed {
  name: string;
  color: string;
}

// Tablica z przykładowymi danymi maszyn, którą nam podesłałeś
const machineSeedData: MachineSeed[] = [
  { name: "TG15", color: "#FF5252" },
  { name: "TG50/1", color: "#7C4DFF" },
  { name: "TG50/2", color: "#448AFF" },
  { name: "LV16", color: "#69F0AE" },
  { name: "LV17", color: "#FFD740" },
  { name: "LV18", color: "#FF6E40" },
  { name: "LV20", color: "#EC407A" },
];

// Funkcja seed, która zapisuje dane maszyn do bazy
async function seedMachines() {
  for (const machine of machineSeedData) {
    await prisma.machine.create({
      data: {
        name: machine.name,
        color: machine.color,
      },
    });
  }
  console.log("Machines seeded.");
}

// Uruchamiamy główną funkcję seed z obsługą błędów i prawidłowym zamknięciem połączenia z bazą
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 

