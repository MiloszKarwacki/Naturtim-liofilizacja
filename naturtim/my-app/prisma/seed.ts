import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

// =====================================================
// CZYSZCZENIE bazy danych
// =====================================================
async function cleanDatabase() {
  console.log("🧹 Czyszczenie bazy danych...");
  
  // Usuwamy rekordy z modeli zależnych najpierw
  await prisma.warehouseFraction.deleteMany({});
  await prisma.warehouse.deleteMany({});
  
  await prisma.batchFraction.deleteMany({});
  await prisma.productionBatch.deleteMany({});
  
  await prisma.permission.deleteMany({});
  await prisma.user.deleteMany({});
  
  await prisma.fraction.deleteMany({});
  await prisma.recipient.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.machine.deleteMany({});
  
  // Czyszczenie audytu
  await prisma.auditLog.deleteMany({});
  
  console.log("✅ Baza danych wyczyszczona!");
}

// =====================================================
// SEED: Użytkownicy i uprawnienia
// =====================================================
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

async function seedUsers() {
  // Tworzymy administratora
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

  // Przypisujemy do administratora uprawnienia
  for (const perm of SEED_PERMISSIONS) {
    await prisma.permission.create({
      data: {
        name: perm.name,
        href: perm.href,
        description: perm.description,
        users: {
          connect: { id: admin.id }
        }
      }
    });
  }

  // Tworzymy dodatkowego użytkownika z wybranymi uprawnieniami
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

  await prisma.user.create({
    data: {
      login: "user",
      password: hashedUserPassword,
      username: "Jan",
      userSurname: "Kowalski",
      permissions: {
        connect: selectedPermissions.map(p => ({ id: p.id })),
      },
    },
  });

  console.log("Użytkownicy i uprawnienia seedowane.");
}

// =====================================================
// SEED: Odbiorcy
// =====================================================
interface RecipientSeed {
  name: string;
}
const recipientSeedData: RecipientSeed[] = [
  { name: 'Brak' },
  { name: 'Inventia' },
  { name: 'Husarich' },
  { name: 'PG' },
  { name: 'Bestlife' },
  { name: 'Bakaliowe smaki' },
];

async function seedRecipients() {
  for (const recipient of recipientSeedData) {
    await prisma.recipient.create({
      data: { name: recipient.name }
    });
  }
  console.log("Recipients seedowani.");
}

// =====================================================
// SEED: Dostawcy
// =====================================================
interface SupplierSeed {
  name: string;
}
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

async function seedSuppliers() {
  for (const supplier of supplierSeedData) {
    await prisma.supplier.create({
      data: { name: supplier.name }
    });
  }
  console.log("Suppliers seedowani.");
}

// =====================================================
// SEED: Produkty
// =====================================================
interface ProductSeed {
  name: string;
}
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

async function seedProducts() {
  for (const product of productSeedData) {
    await prisma.product.create({
      data: { name: product.name }
    });
  }
  console.log("Products seedowane.");
}

// =====================================================
// SEED: Maszyny
// =====================================================
interface MachineSeed {
  name: string;
  color: string;
}
const machineSeedData: MachineSeed[] = [
  { name: "TG15", color: "#FF5252" },
  { name: "TG50/1", color: "#7C4DFF" },
  { name: "TG50/2", color: "#448AFF" },
  { name: "LV16", color: "#69F0AE" },
  { name: "LV17", color: "#FFD740" },
  { name: "LV18", color: "#FF6E40" },
  { name: "LV20", color: "#EC407A" },
];

async function seedMachines() {
  for (const machine of machineSeedData) {
    await prisma.machine.create({
      data: { name: machine.name, color: machine.color }
    });
  }
  console.log("Machines seedowane.");
}

// =====================================================
// SEED: Frakcje
// =====================================================
interface FractionSeed {
  name: string;
  description?: string;
}
const fractionSeedData: FractionSeed[] = [
  { name: "Cały owoc", description: "Produkt w całości, bez cięcia" },
  { name: "Grys", description: "Produkt rozdrobniony na drobne kawałki" },
  { name: "Kostka", description: "Produkt pokrojony w kostki" },
  { name: "Plaster", description: "Produkt pokrojony w plastry" },
  { name: "1/2 plastra", description: "Produkt pokrojony w połówki plastrów" },
  { name: "1/4 plastra", description: "Produkt pokrojony w ćwiartki plastrów" },
  { name: "Proszek", description: "Produkt zmielony na proszek" },
  { name: "Segmenty", description: "Produkt podzielony na naturalne segmenty" }
];

async function seedFractions() {
  for (const fraction of fractionSeedData) {
    await prisma.fraction.create({
      data: { name: fraction.name }
    });
  }
  console.log("Fractions seedowane.");
}

// =====================================================
// SEED: Przykładowa partia produkcyjna oraz frakcja partii
// =====================================================
async function seedProductionBatch() {
  // Pobieramy dane referencyjne
  const product = await prisma.product.findFirst();
  const supplier = await prisma.supplier.findFirst();
  const recipient = await prisma.recipient.findFirst();
  const machine = await prisma.machine.findFirst();

  if (!product || !supplier || !recipient) {
    console.log("Nie udało się znaleźć danych referencyjnych dla ProductionBatch.");
    return;
  }

  // Tworzymy partię produkcyjną
  const batch = await prisma.productionBatch.create({
    data: {
      batchNumber: "01/03/2025",
      product: { connect: { id: product.id } },
      supplier: { connect: { id: supplier.id } },
      recipient: { connect: { id: recipient.id } },
      machine: machine ? { connect: { id: machine.id } } : undefined,
      deliveryDate: new Date("2025-03-01"),
      processStartDate: new Date("2025-03-02"),
      processPlannedEndDate: new Date("2025-03-03"),
      processEndDate: new Date("2025-03-04"),
      initialWeight: 1000,
      mroznia: 1000,
      processInputWeight: 800,
      processOutputWeight: 600,
      polprodukt: 600,
      gotowyProdukt: 0,
      kartony: 10,
      notes: "Przykładowa partia produkcyjna",
    },
  });
  console.log("ProductionBatch seedowana:", batch.id);
  
  // Dodajemy 3 różne frakcje do partii - używając mapowania zamiast ifów
  const fractionData = {
    "Kostka": {
      polproduktWeight: 300,
      gotowyProduktWeight: 250,
      wasteWeight: 30
    },
    "Grys": {
      polproduktWeight: 200,
      gotowyProduktWeight: 150,
      wasteWeight: 15
    },
    "Plaster": {
      polproduktWeight: 100,
      gotowyProduktWeight: 80,
      wasteWeight: 5
    }
  };
  
  for (const [fractionName, values] of Object.entries(fractionData)) {
    const fraction = await prisma.fraction.findFirst({
      where: { name: fractionName },
    });
    
    if (fraction) {
      await prisma.batchFraction.create({
        data: {
          batch: { connect: { id: batch.id } },
          fraction: { connect: { id: fraction.id } },
          polproduktWeight: values.polproduktWeight,
          gotowyProduktWeight: values.gotowyProduktWeight,
          wasteWeight: values.wasteWeight,
          qualityControlDate: new Date("2023-05-03"),
        }
      });
      console.log(`BatchFraction '${fractionName}' seedowana dla partii:`, batch.id);
    } else {
      console.log(`Nie znaleziono frakcji o nazwie '${fractionName}'.`);
    }
  }
}

// =====================================================
// SEED: Magazyny
// =====================================================
interface WarehouseSeed {
  name: string;
  description?: string;
}

const warehouseSeedData: WarehouseSeed[] = [
  { name: "Mroźnia", description: "Magazyn zamrożonych produktów przed liofilizacją" },
  { name: "Półfabrykat", description: "Magazyn produktów po liofilizacji, przed podziałem na frakcje" },
  { name: "Gotowy produkt", description: "Magazyn gotowych produktów po kontroli jakości" },
  { name: "Kartony", description: "Magazyn opakowań" }
];

async function seedWarehouses() {
  for (const warehouse of warehouseSeedData) {
    await prisma.warehouse.create({
      data: { 
        name: warehouse.name,
        totalWeight: 0,
        lastInventoryDate: new Date()
      }
    });
  }
  console.log("Warehouses seedowane.");
}

// =====================================================
// SEED: Frakcje w magazynach
// =====================================================
async function seedWarehouseFractions() {
  // Pobieramy wszystkie magazyny
  const warehouses = await prisma.warehouse.findMany();
  // Pobieramy wszystkie frakcje
  const fractions = await prisma.fraction.findMany();
  
  // Słownik przykładowych wag dla różnych frakcji w różnych magazynach
  const warehouseData = {
    "Mroźnia": {
      "Cały owoc": 250,
      "Kostka": 150,
      "Grys": 100
    },
    "Półfabrykat": {
      "Cały owoc": 180,
      "Kostka": 120,
      "Plaster": 90,
      "Grys": 70
    },
    "Gotowy produkt": {
      "Cały owoc": 150,
      "Kostka": 100,
      "Plaster": 80,
      "Grys": 60,
      "Proszek": 40
    }
  };
  
  // Dla każdego magazynu dodajemy frakcje z odpowiednią wagą
  for (const warehouse of warehouses) {
    // Pomijamy magazyn kartonów (nie ma tam frakcji produktów)
    if (warehouse.name === "Kartony") continue;
    
    // Pobieramy dane dla tego magazynu (lub pusty obiekt jeśli brak)
    const warehouseWeights = warehouseData[warehouse.name as keyof typeof warehouseData] || {};
    
    // Aktualizujemy totalWeight dla magazynu
    let totalWarehouseWeight = 0;
    
    // Dodajemy frakcje do magazynu
    for (const fraction of fractions) {
      // Sprawdzamy czy dla tej frakcji zdefiniowano wagę
      const weight = warehouseWeights[fraction.name as keyof typeof warehouseWeights] || 0;
      
      if (weight > 0) {
        await prisma.warehouseFraction.create({
          data: {
            warehouse: { connect: { id: warehouse.id } },
            fraction: { connect: { id: fraction.id } },
            weight
          }
        });
        
        totalWarehouseWeight += weight;
      }
    }
    
    // Aktualizujemy całkowitą wagę magazynu
    await prisma.warehouse.update({
      where: { id: warehouse.id },
      data: { totalWeight: totalWarehouseWeight }
    });
  }
  
  console.log("WarehouseFractions seedowane.");
}

async function main() {
  await cleanDatabase();
  await seedUsers();
  await seedRecipients();
  await seedSuppliers();
  await seedProducts();
  await seedMachines();
  await seedFractions();
  await seedWarehouses();
  await seedWarehouseFractions();
  await seedProductionBatch();
  
  console.log("Database has been seeded! 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 

